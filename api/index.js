"use strict";

const express = require("express");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 5000;

const config = {
  channelSecret: "1084e84f0f180771034515b852245565",
  channelAccessToken: "Os4/51wBcbdrruQdli9TdcSw2N8vCe4ma9EwbOfrPuuHJMuMu8+OK317jhPEWtEoQ2/fMsQHCC3GoWGus28bF5JzSvdguIAFTwZMx9lHgvTK2E82oI6te12gi8iLrxjby47mxy/yE0ECgPQWWM7VKwdB04t89/1O/w1cDnyilFU="
};

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

const app = express();

app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);

  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

// 初期の会話状態を保存する変数
let conversationState = [];

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  // ユーザーのメッセージを会話に追加
  conversationState.push({ role: "user", content: event.message.text });

  // 会話をOpenAIに送信して応答を取得
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: conversationState, // すべてのメッセージを送信
  });

  // OpenAIからの応答を会話に追加
  conversationState.push({
    role: "assistant",
    content: completion.choices[0].message.content,
  });

  // ユーザーに応答を返信
  return client.replyMessage(event.replyToken, [
    { type: "text", text: completion.choices[0].message.content },
  ]);
}

// app.listen(PORT);
// console.log(`Server running at ${PORT}`);
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);