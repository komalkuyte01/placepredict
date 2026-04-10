import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// API Key Pool — rotates across up to 20 keys when quota is exhausted
// ---------------------------------------------------------------------------

/** Collect all configured API keys from environment variables. */
function loadApiKeys(): string[] {
  const keys: string[] = [];

  // Support GEMINI_API_KEY_1 through GEMINI_API_KEY_20
  for (let i = 1; i <= 20; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key !== "your_api_key_here") {
      keys.push(key);
    }
  }

  // Fallback to the original single-key variable
  if (keys.length === 0) {
    const singleKey = process.env.GEMINI_API_KEY;
    if (singleKey && singleKey !== "your_api_key_here") {
      keys.push(singleKey);
    }
  }

  return keys;
}

/** Check whether the error is a quota / rate-limit error. */
function isQuotaError(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("exceeded") ||
    msg.includes("rate") ||
    msg.includes("resource_exhausted")
  );
}

// ---------------------------------------------------------------------------
// Model fallback with key rotation
// ---------------------------------------------------------------------------

/** Models to try in order of preference. */
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
];

/** Round-robin index — persists across calls within the same server process. */
let currentKeyIndex = 0;

/**
 * Generate content with automatic key rotation AND model fallback.
 *
 * Strategy: for each API key, try ALL models before moving to the next key.
 * Quota is per-model per-key on the free tier, so a key exhausted on one
 * model may still have quota on another.
 *
 * - Quota / rate-limit error  → try NEXT MODEL (same key still has other model quota)
 * - Non-quota error (e.g. model not found) → try NEXT MODEL (same key)
 * - All models exhausted for a key → move to NEXT KEY
 */
export async function generateWithFallback(
  promptParts: (string | Part)[],
): Promise<string> {
  const keys = loadApiKeys();
  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys configured. Add GEMINI_API_KEY or GEMINI_API_KEY_1..20 to your environment.",
    );
  }

  let lastError: Error | null = null;

  for (let k = 0; k < keys.length; k++) {
    const keyIdx = (currentKeyIndex + k) % keys.length;
    const key = keys[keyIdx];

    for (const modelName of FALLBACK_MODELS) {
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptParts);
        // Success — advance the round-robin index for next call
        currentKeyIndex = (keyIdx + 1) % keys.length;
        return result.response.text();
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;

        if (isQuotaError(err)) {
          // This model's quota is exhausted for this key — try next model (same key)
          console.warn(
            `[Gemini] Key ...${key.slice(-6)} hit quota on ${modelName}, trying next model...`,
          );
          continue;
        }

        // Non-quota error (model unavailable, etc.) — try next model with same key
        console.warn(
          `[Gemini] Model ${modelName} failed with key ...${key.slice(-6)} (non-quota):`,
          err.message,
        );
      }
    }

    // All models failed for this key — move to next key
    console.warn(
      `[Gemini] All models exhausted for key ...${key.slice(-6)}, switching to next key...`,
    );
  }

  if (lastError && isQuotaError(lastError)) {
    throw new Error(
      "All API keys and models exhausted. Please wait a minute before trying again, or add more keys.",
    );
  }

  throw lastError ?? new Error("All Gemini models failed");
}
