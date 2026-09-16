import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sessions = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const QUESTIONS = [
  '今日の出来事は何ですか？',
  '明日をどんな1日にしたいですか？',
];

const MAX_FOLLOWUP = 1; // 深掘り回数
client.on('ready', () => {
  console.log(`ログイン成功: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // 開始
  if (message.content === '!diary') {
    sessions.set(userId, {
      step: 0,
      answers: [],
      followUpCount: 0,
    });

    await message.reply('今日の出来事は何ですか？');
    return;
  }

  if (!sessions.has(userId)) return;

  const session = sessions.get(userId);

  session.answers.push(message.content);

  // 深掘りフェーズ
  if (session.followUpCount < MAX_FOLLOWUP) {
    session.followUpCount++;

    const followUp = await generateFollowUpQuestion(message.content);
    await message.reply(followUp);
    return;
  }

  // 最後の質問（明日）
  if (session.step === 0) {
    session.step++;
    await message.reply('明日をどんな1日にしたいですか？');
    return;
  }

  // 終了 → 要約
  await message.reply('ありがとうございます！日記をまとめます…✍️');

  const summary = await generateSummary(session.answers);
  await message.reply(summary);

  sessions.delete(userId);
});

async function generateFollowUpQuestion(answer) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const prompt = `
  あなたは日記アシスタントです。
  以下の回答に対して、内容を深掘りするための質問を1つだけ作ってください。

  条件：
  ・短く自然
  ・1文
  ・質問のみ出力

  回答:
  ${answer}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
async function generateSummary(answers) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const formatted = answers
    .map((a, i) => `質問: ${QUESTIONS[i]}\n回答: ${a}`)
    .join('\n');

  const prompt = `
  あなたは日記アシスタントです。今日は${today}です。
  以下の回答から簡潔な日記を作成してください。

  ${formatted}
  `;

  const result = await model.generateContent(prompt);
  return `${today}の日記\n\n` + result.response.text();
}

client.login(process.env.DISCORD_TOKEN);
