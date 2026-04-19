import { callGemini } from "./gemini";
import { callGroq } from "./groq";

/**
 * Persona prompt templates — each persona gets a tailored system instruction
 * so the AI explains concepts in that persona's language.
 */
const PERSONA_PROMPTS = {
  react: `You are a senior React developer. Explain the following concept using React analogies — think in terms of components, props, state, hooks, the virtual DOM, re-renders, and the React ecosystem. Use code examples where helpful.`,
  datascience: `You are a senior Data Scientist. Explain the following concept using data science analogies — think in terms of datasets, features, models, training, pipelines, distributions, and statistical reasoning. Use code examples (Python/pandas/sklearn) where helpful.`,
  devops: `You are a senior DevOps engineer. Explain the following concept using DevOps analogies — think in terms of containers, CI/CD pipelines, infrastructure-as-code, deployments, monitoring, and orchestration. Use code/config examples where helpful.`,
  designer: `You are a senior UI/UX Designer. Explain the following concept using design analogies — think in terms of user flows, affordances, design systems, visual hierarchy, wireframes, and human-computer interaction. Use concrete examples where helpful.`,
};

/**
 * Builds a full prompt string from the concept and persona.
 */
function buildPrompt(concept, persona) {
  const systemInstruction =
    PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.react;
  return `${systemInstruction}\n\nConcept to explain: "${concept}"`;
}

/**
 * Main entry point called by App.jsx.
 * Accepts a rich options object, builds the persona-aware prompt,
 * tries Gemini first (with the user's API key), falls back to Groq,
 * and invokes the appropriate callbacks.
 *
 * @param {Object} options
 * @param {string} options.concept - The concept to explain
 * @param {string} options.persona - The persona id (react, datascience, devops, designer)
 * @param {string} options.apiKey - The user's Gemini API key
 * @param {AbortSignal} options.signal - AbortController signal
 * @param {function} options.onChunk - Called with text chunks as they arrive
 * @param {function} options.onDone - Called when generation is complete
 * @param {function} options.onError - Called with an Error on failure
 * @param {function} options.onStatusUpdate - Called with status messages
 */
export async function streamExplanation({
  concept,
  persona,
  apiKey,
  signal,
  onChunk,
  onDone,
  onError,
  onStatusUpdate,
}) {
  const promptText = buildPrompt(concept, persona);

  try {
    // Attempt Gemini first
    onStatusUpdate?.("Calling Gemini…");
    const geminiResult = await callGemini(promptText, apiKey, signal, onStatusUpdate);
    onChunk?.(geminiResult);
    onDone?.();
  } catch (geminiError) {
    // If aborted, don't fall back
    if (signal?.aborted) {
      return;
    }

    try {
      // Fall back to Groq
      onStatusUpdate?.("Gemini failed, trying Groq…");
      const groqResult = await callGroq(promptText, signal);
      onChunk?.(groqResult);
      onDone?.();
    } catch (groqError) {
      if (signal?.aborted) {
        return;
      }
      // Both providers failed — report the Gemini error (more relevant to user)
      onError?.(geminiError);
    }
  }
}