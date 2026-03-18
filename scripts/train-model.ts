import fs from "node:fs";
import path from "node:path";
import {
  createModelArtifact,
  generateTrainingDataFromRaw,
  type RawTrainingDataPoint,
  writeModelArtifactToDisk,
} from "../src/lib/ml/placement-ml-engine";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function downloadTrainingData(
  url: string,
  token?: string,
): Promise<RawTrainingDataPoint[]> {
  const tryFetch = async (authToken?: string) => {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  };

  let response = await tryFetch();
  if (
    !response.ok &&
    (response.status === 401 || response.status === 403) &&
    token
  ) {
    console.log(
      "Training data request unauthorized. Retrying with Blob token...",
    );
    response = await tryFetch(token);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to download training data. HTTP ${response.status} ${response.statusText}`,
    );
  }

  const parsed = (await response.json()) as unknown;
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Training data JSON is empty or invalid.");
  }

  return parsed as RawTrainingDataPoint[];
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env"));
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const outputPath = path.join(
    process.cwd(),
    "src",
    "lib",
    "ml",
    "placement-model-artifact.json",
  );

  const trainingDataUrl =
    process.env.TRAINING_DATA_URL || process.env.TRAINGING_DATA_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!trainingDataUrl) {
    throw new Error(
      "TRAINING_DATA_URL is not set. Add TRAINING_DATA_URL (or legacy TRAINGING_DATA_URL) to .env.local/.env.",
    );
  }

  console.log("Starting offline model training...");
  const start = Date.now();

  const rawTrainingData = await downloadTrainingData(
    trainingDataUrl,
    blobToken,
  );
  const trainingData = generateTrainingDataFromRaw(rawTrainingData);

  const artifact = createModelArtifact(trainingData);
  writeModelArtifactToDisk(artifact, outputPath);

  const elapsedMs = Date.now() - start;
  console.log(`Model artifact saved to: ${outputPath}`);
  console.log(`Training completed in ${(elapsedMs / 1000).toFixed(2)}s`);
  console.log("CV metrics:", artifact.cvMetrics);
}

main().catch((error) => {
  console.error("Offline training failed:", error);
  process.exit(1);
});
