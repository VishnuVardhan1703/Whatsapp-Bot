// index.js
import express from "express";
import fetch from "node-fetch"; // or use axios if you prefer

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "test_verify_token";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "PASTE_YOUR_TOKEN_HERE";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "769581496241387";

// Verification endpoint (Meta calls this during webhook setup)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified (token matched)");
    return res.status(200).send(challenge);
  } else {
    console.warn("Webhook verify failed (token mismatch or bad request)", { mode, token });
    return res.sendStatus(403);
  }
});

// Incoming messages handler
app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming webhook payload:", JSON.stringify(req.body).slice(0, 1000));
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (msg && msg.type === "text") {
      const from = msg.from;
      const text = msg.text.body;
      console.log(`Message from ${from}: ${text}`);

      // Simple reply: echo back
      await fetch(`https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: `You said: ${text}` },
        }),
      });
    }
  } catch (err) {
    console.error("Error in webhook handler:", err?.message || err);
  }
  res.sendStatus(200);
});

// Use port provided by host (Render/Railway) or 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
