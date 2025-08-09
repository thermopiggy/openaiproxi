import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

// Разрешаваме CORS за всички домейни
app.use(cors());
app.use(express.json());

// Route за тест дали работи
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Основният чат route
app.post('/chat', async (req, res) => {
  try {
    const messages = req.body.messages || [];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5", // или "gpt-4o" ако искаш
        messages
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});
