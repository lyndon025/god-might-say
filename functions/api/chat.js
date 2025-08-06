// functions/api/chat.js

export async function onRequestPost({ request, env }) {
  const { recentExchanges, userMessage } = await request.json();

  // DEBUG: Confirm function is being hit and max_tokens is included
  console.log("[chat.js] ✅ Function triggered");
  console.log("[chat.js] Received userMessage:", userMessage);
  console.log("[chat.js] Using model: google/gemini-2.5-flash-lite");

  const payload = {
    model: "google/gemini-2.5-flash-lite",
    messages: [
      { role: "system", content: env.SYSTEM_PROMPT },
      ...recentExchanges,
      { role: "user", content: userMessage },
    ],
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 1,
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[chat.js] ❌ OpenRouter error:", data);
      return new Response(JSON.stringify({
        success: false,
        error: data.error?.message || "Unknown error from OpenRouter",
        debug: { payload }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      content: data.choices?.[0]?.message?.content ?? "No response.",
      id: data.id,
      debug: { model: payload.model, max_tokens: payload.max_tokens },
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[chat.js] ❌ Network or unexpected error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      debug: { payload }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
