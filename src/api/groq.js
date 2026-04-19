/**
 * Calls the Groq API as a fallback when Gemini fails.
 * Uses the VITE_GROQ_KEY from environment variables.
 *
 * @param {string} promptText - The full prompt to send
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<string>} The generated text
 */
export async function callGroq(promptText, signal) {
  const groqKey = import.meta.env.VITE_GROQ_KEY;

  if (!groqKey) {
    throw new Error("Groq API key is not configured.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
      }),
      signal,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Groq API error (${response.status})`);
  }

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}