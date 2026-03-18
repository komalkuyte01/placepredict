import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "ml",
  "placement-model-artifact.json",
);

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

async function downloadArtifact(
  url: string,
  token?: string,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });
}

async function main() {
  loadEnvFile(path.join(process.cwd(), ".env"));
  loadEnvFile(path.join(process.cwd(), ".env.local"));

  const url = process.env.MODEL_ARTIFACT_URL;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!url) {
    if (fs.existsSync(outputPath)) {
      console.log(
        "MODEL_ARTIFACT_URL is not set. Using existing local placement-model-artifact.json",
      );
      return;
    }

    throw new Error(
      "MODEL_ARTIFACT_URL is not set and no local artifact exists. Set MODEL_ARTIFACT_URL or run npm run train:model.",
    );
  }

  console.log("Fetching placement model artifact from remote storage...");

  let response = await downloadArtifact(url);

  if (
    !response.ok &&
    (response.status === 401 || response.status === 403) &&
    token
  ) {
    console.log(
      "Initial artifact request unauthorized. Retrying with Blob token...",
    );
    response = await downloadArtifact(url, token);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch artifact. HTTP ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Downloaded artifact is not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Downloaded artifact JSON has invalid structure.");
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), "utf-8");

  console.log(`Model artifact saved to ${outputPath}`);
}

main().catch((error) => {
  console.error("Artifact fetch failed:", error);
  process.exit(1);
});
