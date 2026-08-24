// Real AI assistant backend — a Firebase Cloud Function that calls the
// Claude API server-side (so your API key never reaches the browser) and
// returns a genuine LLM answer instead of the keyword-matched fallback.
//
// SETUP:
//   1. This requires the Blaze plan (same one you're enabling for phone
//      auth SMS) — Cloud Functions can't call external APIs on the free
//      Spark plan.
//   2. Get an API key from https://console.anthropic.com (Anthropic,
//      Claude's maker) — pay-as-you-go, no separate subscription needed.
//   3. From the `agrimitra/functions` folder, run:
//        npm install
//        firebase functions:secrets:set ANTHROPIC_API_KEY
//      (paste your key when prompted — this stores it securely, not in
//      your code or .env file)
//   4. Deploy: firebase deploy --only functions
//   5. Copy the function's URL from the deploy output into your app's
//      `.env` as VITE_AI_FUNCTION_URL
//
// Until this is deployed, the app's AI Assistant keeps using its built-in
// keyword-matched replies automatically — nothing breaks in the meantime.

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

const SYSTEM_PROMPT = `You are AgriMitra's AI farm assistant, helping small and marginal Indian farmers.
Answer clearly and practically about crop cultivation, plant diseases and pests, fertilizers,
irrigation, government schemes, organic farming, soil health, livestock, and market prices.
Keep answers concise (3-5 sentences), specific, and actionable — real product/technique names
where relevant. If asked something unrelated to farming, gently redirect to farming topics.
Respond in the same language as the user's question (English, Telugu, or Hindi) — match their language exactly.`;

exports.aiAssistant = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "method_not_allowed" });
      return;
    }
    const { message, lang } = req.body || {};
    if (!message) {
      res.status(400).json({ error: "missing_message" });
      return;
    }
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `[Respond in language code: ${lang || "en"}] ${message}` }],
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        res.status(502).json({ error: "anthropic_error", detail: text });
        return;
      }
      const data = await response.json();
      const reply = data?.content?.find((c) => c.type === "text")?.text || "Sorry, I couldn't generate a reply just now.";
      res.status(200).json({ reply });
    } catch (err) {
      res.status(500).json({ error: "server_error", detail: String(err) });
    }
  }
);
