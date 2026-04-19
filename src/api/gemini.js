/**
 * Gemini model fallback chain — if the primary model's quota is
 * exhausted, we try the next one automatically.
 */
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
];

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 2000;

/**
 * Wait for the given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks whether an error is retryable (rate-limit, quota, or model not found).
 */
function isRetryableError(status, errorMsg) {
  if (status === 429) return true;
  if (status === 404) return true; // model not found — try next model
  if (status === 403 && errorMsg?.toLowerCase().includes("quota")) return true;
  return false;
}

/**
 * Attempts to call a single Gemini model with retry + exponential backoff.
 *
 * @param {string} model - Gemini model name
 * @param {string} promptText - The full prompt to send
 * @param {string} apiKey - Gemini API key
 * @param {AbortSignal} [signal] - Optional abort signal
 * @param {function} [onStatusUpdate] - Optional status callback
 * @returns {Promise<string>} The generated text
 */
async function callModel(model, promptText, apiKey, signal, onStatusUpdate) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      onStatusUpdate?.(`Rate limited — retrying ${model} in ${Math.round(delay / 1000)}s…`);
      await sleep(delay);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
          signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || `Gemini API error (${response.status})`;

        // If it's a rate-limit error, retry this model
        if (isRetryableError(response.status, msg) && attempt < MAX_RETRIES) {
          lastError = new Error(msg);
          continue;
        }

        throw new Error(msg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return text;
    } catch (err) {
      // Re-throw abort errors immediately
      if (err.name === "AbortError") throw err;

      lastError = err;

      // Only retry on rate-limit errors
      const isRetryable = err.message?.toLowerCase().includes("quota") ||
                           err.message?.includes("429");
      if (!isRetryable || attempt >= MAX_RETRIES) {
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Calls the Gemini API with automatic model fallback and retry logic.
 * Tries each model in the fallback chain before giving up.
 *
 * @param {string} promptText - The full prompt to send
 * @param {string} apiKey - Gemini API key
 * @param {AbortSignal} [signal] - Optional abort signal
 * @param {function} [onStatusUpdate] - Optional status callback
 * @returns {Promise<string>} The generated text
 */
export async function callGemini(promptText, apiKey, signal, onStatusUpdate) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      onStatusUpdate?.(`Trying ${model}…`);
      return await callModel(model, promptText, apiKey, signal, onStatusUpdate);
    } catch (err) {
      if (err.name === "AbortError") throw err;

      lastError = err;
      const isModelFallbackError =
        err.message?.toLowerCase().includes("quota") ||
        err.message?.includes("429") ||
        err.message?.toLowerCase().includes("not found") ||
        err.message?.includes("404");

      // Only fall through to next model on quota/rate-limit/not-found errors
      if (!isModelFallbackError) {
        throw err;
      }

      onStatusUpdate?.(`${model} quota exceeded, trying next model…`);
    }
  }

  // All models exhausted
  throw lastError || new Error("All Gemini models quota exceeded.");
}