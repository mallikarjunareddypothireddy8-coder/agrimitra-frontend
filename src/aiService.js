// Calls the real AI assistant — a Netlify Function (netlify/functions/ai-
// assistant.js) that's free with no billing card (see that file for setup).
// Throws if it's not deployed yet or the call fails, so the caller
// (AIAssistant component) falls back to the built-in keyword-matched
// replies automatically — the chat never just breaks either way.

export async function askRealAI(message, lang) {
  const res = await fetch("/.netlify/functions/ai-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, lang }),
  });
  if (!res.ok) throw new Error(`ai_function_http_${res.status}`);
  const data = await res.json();
  if (!data?.reply) throw new Error("ai_function_no_reply");
  return data.reply;
}
