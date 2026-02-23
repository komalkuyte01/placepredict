/**
 * Resume Parser - Text extraction utilities.
 * Resume parsing is now handled by Gemini AI via the /api/parse-resume route.
 */

import type {
  CandidateProfile,
  ResumeParseResult,
} from "@/lib/types/placement";

/**
 * Extracts text content from plain text file.
 */
async function extractTextFromTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || "");
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Extracts text content from file.
 * Supports plain text files (.txt).
 * For PDF parsing, use the /api/parse-resume route which handles PDF extraction server-side.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return extractTextFromTextFile(file);
}

/**
 * Parse resume using the Gemini AI API.
 * This is a client-side wrapper that calls the /api/parse-resume endpoint.
 * @deprecated Use the /api/parse-resume API route directly instead
 */
export async function parseResume(file: File): Promise<ResumeParseResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      extractedData: {} as Partial<CandidateProfile>,
      confidence: 0,
      missingFields: [],
      warnings: [
        error instanceof Error ? error.message : "Failed to parse resume",
      ],
    };
  }
}
