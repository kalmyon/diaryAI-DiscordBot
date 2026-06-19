# DiaryAI Discord Bot

Discord上で動作する対話型AI日記Botです。

ユーザーとの会話を通してその日の出来事を深掘りし、最後にGoogle Geminiを用いて日記として要約します。

## 概要

DiaryAI Discord Botは、日々の出来事を記録するためのDiscord Botです。

通常の日記アプリのように単純な入力を求めるのではなく、AIがユーザーの回答に応じて追加質問を行うことで、その日の出来事や感情をより詳しく引き出します。

会話終了後、Gemini APIを利用して日記形式に要約し、Discord上に出力します。

---

## 主な機能

- Discord上での日記作成
- 対話形式による質問
- 回答内容に応じたAIによる深掘り質問
- Gemini APIによる日記要約
- ユーザーごとのセッション管理
- 複数ユーザーの同時利用

---

## 使用技術

### Backend

- Node.js
- JavaScript (ES Modules)

### Discord Bot

- discord.js

### Generative AI

- Google Gemini API
- @google/generative-ai

### Environment Management

- dotenv

---

## システム構成

```text
Discord
   ↓
Discord Bot (discord.js)
   ↓
Gemini API
   ↓
日記生成・深掘り質問生成
```

---

## インストール

### リポジトリのクローン

```bash
git clone https://github.com/kalmyon/diaryAI-DiscordBot.git
cd diaryAI-DiscordBot
```

### パッケージのインストール

```bash
npm install
```

---

## 環境変数

プロジェクト直下に `.env` を作成してください。

```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Discord Bot Token

Discord Developer Portalで取得できます。

### Gemini API Key

Google AI Studioで取得できます。

---

## 実行方法

```bash
node index.js
```

起動に成功するとコンソールにBotのログイン情報が表示されます。

```text
ログイン成功: DiaryAI#1234
```

---

## 使い方

Discordで以下のコマンドを送信します。

```text
!diary
```