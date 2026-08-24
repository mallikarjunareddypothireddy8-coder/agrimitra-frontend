// Real AI assistant backend — runs as a Netlify Function (automatically
// deployed alongside your site, no separate service or card needed) and
// calls Google's Gemini API, which has a genuinely free tier with NO
// billing card required — unlike the Firebase/Claude route in
// functions/index.js, which needs the paid Blaze plan.
//
// SETUP (free, ~3 minutes):
//   1. Go to https://aistudio.google.com/app/apikey
//   2. Sign in with any Google account → "Create API key" → copy it
//      (no card, no billing account, nothing to pay)
//   3. In Netlify: your site → Site configuration → Environment variables
//      → Add a variable named GEMINI_API_KEY with that key as the value
//      (NOT in your local .env file — Netlify Functions read Netlify's own
//      environment variables, set in its dashboard, not the Vite one)
//   4. Redeploy your site (Netlify → Deploys → Trigger deploy) so the
//      function picks up the new variable
//
// To test this locally before deploying: install the Netlify CLI
// (`npm install -g netlify-cli`), then run `netlify dev` instead of
// `npm run dev` — it runs your Vite app AND this function together.
// Plain `npm run dev` alone won't run this function, and the app will
// automatically fall back to its built-in rule-based replies, which is
// expected and not a bug.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "gemini_not_configured" }) };
  }

  let message, lang;
  try {
    ({ message, lang } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_body" }) };
  }
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_message" }) };
  }

  const systemPrompt = `You are AgriMitra's AI farm assistant, helping small and marginal Indian farmers.
Answer clearly and practically about crop cultivation, plant diseases and pests, fertilizers,
irrigation, government schemes, organic farming, soil health, livestock, and market prices.
Keep answers concise (3-5 sentences), specific, and actionable. If asked something unrelated to
farming, gently redirect to farming topics. Respond in the same language as the user's question
(English, Telugu, or Hindi) — the requested language code is "${lang || "en"}".`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );
    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: "gemini_error", detail }) };
    }
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return { statusCode: 502, body: JSON.stringify({ error: "gemini_no_reply" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "server_error", detail: String(err) }) };
  }
};
