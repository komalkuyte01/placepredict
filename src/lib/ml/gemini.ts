import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// API Key Pool — rotates across up to 8 keys when quota is exhausted
// ---------------------------------------------------------------------------

/** Collect all configured API keys from environment variables. */
function loadApiKeys(): string[] {
  const keys: string[] = [];

  // Support GEMINI_API_KEY_1 through GEMINI_API_KEY_8
  for (let i = 1; i <= 8; i++) {
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

/** Round-robin index — persists across calls within the same server process. */
let currentKeyIndex = 0;

/** Get the next API key in the pool (round-robin). */
function getNextKey(keys: string[]): string {
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

/** Create a GoogleGenerativeAI instance using the next available key. */
export function getGenAI(): GoogleGenerativeAI {
  const keys = loadApiKeys();
  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys configured. Add GEMINI_API_KEY or GEMINI_API_KEY_1..8 to your environment.",
    );
  }
  return new GoogleGenerativeAI(getNextKey(keys));
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

/** Models to try in order. Different models often have separate free-tier quota limits. */
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash",
  "gemini-3.1-flash-lite",
];

/**
 * Generate content with automatic model fallback AND key rotation.
 *
 * Strategy: for each model, try every available API key before moving
 * to the next model. This maximises the chance of a successful response.
 */
export async function generateWithFallback(
  _genAI: GoogleGenerativeAI | null,
  promptParts: (string | Part)[],
): Promise<string> {
  const keys = loadApiKeys();
  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys configured. Add GEMINI_API_KEY or GEMINI_API_KEY_1..8 to your environment.",
    );
  }

  let lastError: Error | null = null;

  for (const modelName of FALLBACK_MODELS) {
    // Try each key for this model
    for (let k = 0; k < keys.length; k++) {
      const key = getNextKey(keys);
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptParts);
        return result.response.text();
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;

        if (isQuotaError(err)) {
          console.warn(
            `[Gemini] Key ...${key.slice(-6)} hit quota on ${modelName}, rotating...`,
          );
          continue; // try next key
        }

        // Non-quota error — skip to next model
        console.warn(
          `[Gemini] Model ${modelName} failed (non-quota):`,
          err.message,
        );
        break;
      }
    }
  }

  if (lastError && isQuotaError(lastError)) {
    throw new Error(
      "All API keys and models exhausted. Please wait a minute before trying again, or add more keys.",
    );
  }

  throw lastError ?? new Error("All Gemini models failed");
}
