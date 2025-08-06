// functions/api/chat.js

export async function onRequestPost({ request, env }) {
  const { recentExchanges, userMessage } = await request.json();

  const payload = {
    model: "google/gemini-2.5-flash-lite",
    messages: [
      { role: "system", content: env.SYSTEM_PROMPT },
      ...recentExchanges,
      { role: "user", content: userMessage }
    ]
    max_tokens: 1024, 
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
