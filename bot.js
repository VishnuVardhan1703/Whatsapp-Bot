const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// 🔹 Your details
const VERIFY_TOKEN = "my_verify_token"; // Use this when setting up webhook on Meta
const WHATSAPP_TOKEN = "EAA6ZAMZCdXVo8BPQFwpvjmrmwfuyDYIxLiZBfPZBV1G3ek2UEJeaMCQC9ayHmvfy971mcK3Fsws0zzKWQLLxMPDa9PGUClKYQNeVohmCgBFWHhx0PrXYE5EwFuBYmEVcz46XnZC1syhdvXZCWNj866GawPZByeqpNfiVUj3fn4BJR74xYwAoqcE5Kf9SZCMQmQUO6375phILtHMTVr6ebgApoG5fqLNjNVZANwYIGWrEF2PNBCYbnkqnbbIe4EUVLZBAZDZD";
const PHONE_NUMBER_ID = "769581496241387";

// ✅ Verification (Meta will call this first)  
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified ✅");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Handling messages
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0]?.value?.messages;

    if (changes && changes[0]) {
      const phone = changes[0].from; // user phone number
      const text = changes[0].text.body;

      console.log(`📩 Message from ${phone}: ${text}`);

      // ✅ Send reply
      await sendMessage(phone, `You said: ${text}`);
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }

  res.sendStatus(200);
});

// ✅ Function to send a message
async function sendMessage(to, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`➡️ Sent: ${message}`);
  } catch (err) {
    console.error("❌ Send error:", err.response?.data || err.message);
  }
}

app.listen(3000, () => {
  console.log("🚀 Bot server running on port 3000");
});
