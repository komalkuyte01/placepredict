import type { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Models to try in order. Different models often have separate free-tier quota limits.
const FALLBACK_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
];

export async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  promptParts: (string | Part)[],
): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptParts);
      return result.response.text();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.warn(`[Gemini Fallback] Model ${modelName} failed:`, err.message);
      lastError = err;
      // Continue to next model on failure (usually 429 Quota Exceeded)
    }
  }

  // If all models hit quota
  if (
    lastError?.message.includes("429") ||
    lastError?.message.includes("exceeded")
  ) {
    throw new Error(
      "API Quota Exceeded. You have made too many requests in a short time. Please wait 1 minute before trying again.",
    );
  }

  throw lastError;
}
