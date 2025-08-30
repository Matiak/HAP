import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// Middleware -- automatic JSON parsing
app.use(express.json());

// In-memory storage: { topic: lastMessage }
const messages = {};

// --- Webhook endpoint (EMQX POST Webhook) ---
app.post("/webhook", (req, res) => {
  const { topic, payload } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Missing 'topic' in request" });
  }

  messages[topic] = {
    payload,
    timestamp: new Date().toISOString(),
  };

  console.log(`Received message on ${topic}:`, payload);

  res.status(200).json({ status: "ok" });
});

// --- API: list of topics ---
app.get("/topics", (req, res) => {
  res.json(Object.keys(messages));
});

// --- API: last message for a topic ---
app.get("/topic/:name", (req, res) => {
  const topic = req.params.name;

  if (!messages[topic]) {
    return res.status(404).json({ error: "Topic not found" });
  }

  res.json(messages[topic]);
});

// Health check (Render needs this sometimes)
app.get("/", (req, res) => {
  res.send("MQTT Webhook Service is running");
});

// Start server
app.listen(port, () => {
  console.log(`Service running on port ${port}`);
});
