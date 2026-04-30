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
    GatewayIntentBits.MessageContent
  ]
});

const QUESTIONS = [
  "今日の出来事は何ですか？",
  "明日をどんな1日にしたいですか？"
];


client.on('ready', () => {
  console.log(`ログイン成功: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // 開始
  if (message.content === '!diary') {
    sessions.set(userId, { step: 0, answers: [] });
    await message.reply("こんにちは！AI日記を始めます。\n" + QUESTIONS[0]);
    return;
  }

  // セッションがなければ無視
  if (!sessions.has(userId)) return;

  const session = sessions.get(userId);

  // 回答保存
  session.answers.push(message.content);
  session.step++;

  // 次の質問
  if (session.step < QUESTIONS.length) {
    await message.reply(QUESTIONS[session.step]);
  } else {
    await message.reply("ありがとうございます！日記をまとめます…✍️");

    const summary = await generateSummary(session.answers);
    await message.reply(summary);

    sessions.delete(userId);
  }
});
async function generateSummary(answers) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const formatted = answers.map((a, i) =>
    `質問: ${QUESTIONS[i]}\n回答: ${a}`
  ).join('\n');

  const prompt = `
あなたは日記アシスタントです。今日は${today}です。
以下の回答から簡潔な日記を作成してください。

${formatted}
`;

  const result = await model.generateContent(prompt);
  return `${today}の日記\n\n` + result.response.text();
}

client.login(process.env.DISCORD_TOKEN);