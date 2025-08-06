// src/utils/SendToLLM.js

export default async function SendToLLM({ userMessage, recentExchanges }) {
  const isDev = import.meta.env.MODE === 'development';

  try {
    let response;
    let prompt = "You are a helpful assistant.";

    if (isDev) {
      try {
        // ✅ Safe dev-only dynamic import (avoids Vite build errors)
        const module = await (new Function('return import("/system-prompt.txt?raw")'))();
        prompt = module.default;
        console.info("✅ Loaded system prompt from system-prompt.txt");
      } catch {
        // 🔁 Fallback to .env if file missing or ignored
        prompt = import.meta.env.VITE_SYSTEM_PROMPT?.replace(/\\n/g, "\n") || prompt;
        console.warn("📎 system-prompt.txt not found — using VITE_SYSTEM_PROMPT instead.");
      }

      const body = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: prompt },
          ...recentExchanges,
          { role: "user", content: userMessage },
        ],
        max_tokens: 1024, 
      };

      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } else {
      // 🚀 Production: prompt is handled inside Cloudflare backend
      response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentExchanges, userMessage }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error.message || 'Unknown error');
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices?.[0]?.message?.content ?? "No response.",
      id: data.id
    };
  } catch (error) {
    console.error("SendToLLM error:", error);
    return { success: false, error: error.message };
  }
}
