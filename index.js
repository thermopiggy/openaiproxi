// index.js — OpenAI proxy с логове
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // node-fetch ^3.3.2

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/", (_req, res) => res.type("text/plain").send("openai-proxi up"));
app.get("/health", (_req, res) => res.json({ ok: true }));

// Preflight
app.options("/chat", (_req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  });
  res.sendStatus(200);
});

// Chat endpoint с логове
app.post("/chat", async (req, res) => {
  try {
    const { messages, model } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages[] is required" });
    }

    console.log("➡️ Incoming request:", JSON.stringify({ messages, model }, null, 2));

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages,
        temperature: 0.7
      })
    });

    const text = await r.text();
    console.log("⬅️ OpenAI status:", r.status);
    console.log("⬅️ OpenAI raw response:", text);

    res.status(r.status).type("application/json").send(text);
  } catch (e) {
    console.error("proxy_error:", e);
    res.status(500).json({ error: "proxy_error", detail: String(e) });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy listening on port ${PORT}`));
