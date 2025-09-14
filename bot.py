from flask import Flask, request
import requests
import os

app = Flask(__name__)

# 🔹 Set your verify token (must match Meta dashboard)
VERIFY_TOKEN = "test1"

# 🔹 Set your WhatsApp API credentials
WHATSAPP_TOKEN = "EAA6ZAMZCdXVo8BPT9ZCTVC7ZC2XTH0my4IHt2keageZAaBSWQZAi3DbudYiumhZBQFEjLTIXeD6TwULuI6y85DTz3nrLgbd0afVazpUZA8LogfeCOWP3K20Ks4HVS4yVSxrSebLmHHqle4aFCda5PZChAMZCmj5ZCVqmm81J1EDJNZCRPL1yauBere1erlvmwfGCzUbRoMAKmr2Tma5ogNFYZC8Kk5sH7jDl8xZCHKcqBY6c9E4CUqHTB8U8vZBsS3QnbaMlAZDZD"   # Replace with your token from Meta
PHONE_NUMBER_ID = "769581496241387"    # Replace with your phone number ID

@app.route("/webhook", methods=["GET", "POST"])
def webhook():
    if request.method == "GET":
        # ✅ Verification step from Meta
        token_sent = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")
        if token_sent == VERIFY_TOKEN:
            return challenge
        return "Invalid verification token", 403

    if request.method == "POST":
        data = request.get_json()
        print("📩 Incoming:", data)

        try:
            # ✅ Extract sender & message
            phone_number = data["entry"][0]["changes"][0]["value"]["messages"][0]["from"]
            message_text = data["entry"][0]["changes"][0]["value"]["messages"][0]["text"]["body"]

            print(f"Message from {phone_number}: {message_text}")

            # ✅ Send auto reply
            send_message(phone_number, "Hello 👋! I received your message: " + message_text)

        except Exception as e:
            print("⚠️ Error:", e)

        return "ok", 200


def send_message(to, text):
    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text}
    }
    response = requests.post(url, headers=headers, json=payload)
    print("➡️ Sent:", response.json())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
