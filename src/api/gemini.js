const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
];

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(status, message) {
  return (
    status === 429 ||
    status === 404 ||
    (status === 403 && message?.toLowerCase().includes("quota"))
  );
}

async function callModel(model, promptText, apiKey, signal, onStatusUpdate) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      onStatusUpdate?.(`Retrying ${model} in ${delay / 1000}s...`);
      await sleep(delay);
    }

    try {
      const body = {
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Gemini error:", data);

        const msg =
          data?.error?.message || `Gemini API error (${response.status})`;

        if (isRetryableError(response.status, msg) && attempt < MAX_RETRIES) {
          lastError = new Error(msg);
          continue;
        }

        throw new Error(msg);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini returned empty response.");
      }

      return text;
    } catch (err) {
      if (err.name === "AbortError") throw err;

      lastError = err;

      const retry =
        err.message?.toLowerCase().includes("quota") ||
        err.message?.toLowerCase().includes("resource_exhausted") ||
        err.message?.includes("429");

      if (!retry || attempt >= MAX_RETRIES) {
        throw err;
      }
    }
  }

  throw lastError;
}

export async function callGemini(promptText, apiKey, signal, onStatusUpdate) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      onStatusUpdate?.(`Trying ${model}...`);

      return await callModel(
        model,
        promptText,
        apiKey,
        signal,
        onStatusUpdate
      );
    } catch (err) {
      if (err.name === "AbortError") throw err;

      lastError = err;

      const fallback =
        err.message?.toLowerCase().includes("quota") ||
        err.message?.toLowerCase().includes("resource_exhausted") ||
        err.message?.includes("429") ||
        err.message?.includes("404");

      if (!fallback) {
        throw err;
      }

      onStatusUpdate?.(`${model} failed, trying next model...`);
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}