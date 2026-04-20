import { callGemini } from "./gemini";
import { callGroq } from "./groq";

const PERSONA_PROMPTS = {
  react: `You are a senior React developer. Explain the following concept using React analogies — think in terms of components, props, state, hooks, virtual DOM, and re-renders.`,
  
  datascience: `You are a senior Data Scientist. Explain using datasets, models, features, pipelines, and statistical reasoning.`,

  devops: `You are a senior DevOps engineer. Explain using CI/CD, containers, infrastructure, deployments, and monitoring.`,

  designer: `You are a senior UI/UX Designer. Explain using design systems, user flows, affordances, and visual hierarchy.`,
};

function buildPrompt(concept, persona) {
  const systemInstruction =
    PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.react;

  return `${systemInstruction}\n\nConcept to explain: "${concept}"`;
}

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
    onStatusUpdate?.("Calling Gemini...");
    const geminiResult = await callGemini(
      promptText,
      apiKey,
      signal,
      onStatusUpdate
    );

    onChunk?.(geminiResult);
    onDone?.();
  } catch (geminiError) {
    if (signal?.aborted) return;

    try {
      onStatusUpdate?.("Gemini failed, trying Groq...");
      const groqResult = await callGroq(promptText, signal);

      onChunk?.(groqResult);
      onDone?.();
    } catch (groqError) {
      if (signal?.aborted) return;
      onError?.(groqError);
    }
  }
}