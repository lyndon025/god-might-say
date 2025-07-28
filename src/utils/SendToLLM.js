// src/utils/SendToLLM.js
export default async function SendToLLM({ userMessage, recentExchanges }) {
  const isDev = import.meta.env.MODE === 'development';

  try {
    let response;

    if (isDev) {
      const prompt = import.meta.env.VITE_SYSTEM_PROMPT?.replace(/\\n/g, "\n") ||
        "You are a helpful assistant.";

      const body = {
        model: "gpt-4",
        messages: [
          { role: "system", content: prompt },
          ...recentExchanges,
          { role: "user", content: userMessage },
        ],
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
