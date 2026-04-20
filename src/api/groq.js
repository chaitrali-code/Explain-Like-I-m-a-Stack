export async function callGroq(promptText, signal) {
  const groqKey = import.meta.env.VITE_GROQ_KEY;

  if (!groqKey) {
    throw new Error("Groq API key missing.");
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
        model: "llama-3.1-8b-instant",
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
    console.log("Groq error:", data);

    throw new Error(
      data?.error?.message || `Groq API error (${response.status})`
    );
  }

  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned empty response.");
  }

  return text;
}