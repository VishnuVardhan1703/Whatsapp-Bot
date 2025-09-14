// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Environment variables
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "test_verify_token";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "PASTE_YOUR_TOKEN_HERE";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "YOUR_PHONE_NUMBER_ID";

// Root route
app.get("/", (req, res) => {
  res.send("✅ WhatsApp Bot is running");
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.warn("❌ Webhook verification failed", { mode, token });
    res.sendStatus(403);
  }
});

// Webhook receiver (messages + statuses)
app.post("/webhook", async (req, res) => {
  try {
    const changes = req.body.entry?.[0]?.changes?.[0]?.value;

    // --- Handle text messages ---
    const msg = changes?.messages?.[0];
    if (msg && msg.type === "text") {
      const from = msg.from;
      const text = msg.text.body.toLowerCase().trim(); // normalize input
      console.log(`💬 Message from ${from}: ${text}`);

      let reply;

      // Keyword-based replies
      if (["hi", "hello"].includes(text)) {
        reply = "👋 Hello! How can I help you today?";
      } else if (text.includes("bye")) {
        reply = "👋 Goodbye! Have a great day.";
      } else if (text.includes("help")) {
        reply = "🛠 Available commands: hi, bye, help, joke";
      } else if (text.includes("joke")) {
        reply = "😂 Why don’t programmers like nature? It has too many bugs.";
      } else {
        reply = `🤖 I didn’t understand that. Try typing "help".`;
      }

      // Send reply back
      await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: reply },
        }),
      });
    }

    // --- Handle message status updates ---
    const statuses = changes?.statuses;
    if (statuses) {
      statuses.forEach((status) => {
        console.log(`📊 Status update: Message ${status.id} is now ${status.status}`);
      });
    }

  } catch (err) {
    console.error("🔥 Error in webhook handler:", err?.message || err);
  }

  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
