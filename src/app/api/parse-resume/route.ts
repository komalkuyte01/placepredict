import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

type DegreeBranch =
  | "Computer Science"
  | "Information Technology"
  | "Electronics"
  | "Electrical"
  | "Mechanical"
  | "Civil"
  | "Other";
type DSALevel = "None" | "Basic" | "Intermediate" | "Advanced";

interface ParsedResumeData {
  academic: {
    cgpa?: number | null;
    tenthPercentage?: number | null;
    twelfthPercentage?: number | null;
    degreeBranch?: DegreeBranch;
    backlogs?: number;
  };
  technical: {
    technicalSkills: string[];
    dsaLevel: DSALevel;
    projectsCount: number;
    hasInternship: boolean;
    certifications: string[];
  };
  experience: {
    hackathonsCount: number;
    hasOpenSourceContributions: boolean;
    resumeATSScore: number;
  };
}

const RESUME_PARSE_PROMPT = `You are an expert resume parser. Analyze the provided PDF document.

STEP 1 — VALIDATION:
First, determine if this document is a valid, genuine professional resume or CV.
If the document is ANY of the following, return EXACTLY this JSON and nothing else:
{
  "error": "Please upload a valid resume document."
}
- A certificate, diploma, or award
- An academic transcript without resume sections
- An invoice, letter, or unrelated business document
- A blank or nearly-blank document
- Garbage data, gibberish, or random content
- Any document that does not contain standard resume sections (e.g. contact info, education, experience, skills, projects)

STEP 2 — EXTRACTION (only if the document IS a valid resume):
Extract structured data and return ONLY a JSON object, no markdown.

Schema (use null if not found, [] for empty arrays):
{
  "academic": {
    "cgpa": number|null,          // 0-10 scale, convert from % if needed
    "tenthPercentage": number|null,
    "twelfthPercentage": number|null,
    "degreeBranch": "Computer Science"|"Information Technology"|"Electronics"|"Electrical"|"Mechanical"|"Civil"|"Other",
    "backlogs": number            // default 0
  },
  "technical": {
    "technicalSkills": string[],  // ALL: languages, frameworks, DBs, tools, cloud
    "dsaLevel": "None"|"Basic"|"Intermediate"|"Advanced",
    "projectsCount": number,      // count all projects
    "hasInternship": boolean,
    "certifications": string[]
  },
  "experience": {
    "hackathonsCount": number,
    "hasOpenSourceContributions": boolean,
    "resumeATSScore": number      // 0-100, realistic (most resumes: 40-70)
  }
}

DSA mapping: None=no mention, Basic=arrays/sorting, Intermediate=trees/graphs/DP, Advanced=competitive programming/hard problems.
ATS score: keyword density, section structure, parsability, quantified achievements. Most=40-70, well-optimized=75-85.
Capitalize properly: "JavaScript", "React", "AWS", "Docker".
`;

/** Gemini models to try, in order of preference. Falls back to lower models on quota errors. */
const GEMINI_MODELS = [
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

/** Maximum PDF size for Gemini inline data (4 MB) */
const MAX_PDF_SIZE = 4 * 1024 * 1024;

/**
 * Parse resume by sending the PDF directly to Gemini as inline data.
 * Gemini can "see" the visual layout, handling two-column and complex formats correctly.
 */
async function parseResumeWithGemini(
  genAI: GoogleGenerativeAI,
  fileBuffer: Buffer,
): Promise<ParsedResumeData> {
  let lastError: Error | null = null;

  const filePart: Part = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: "application/pdf",
    },
  };

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        RESUME_PARSE_PROMPT,
        filePart,
      ]);

      const responseText = result.response.text();

      // Clean up the response - remove markdown code blocks and trim
      let cleanedResponse = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Try to find JSON object in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedResponse);

      // Check if Gemini flagged this as an invalid document
      if (parsed.error && typeof parsed.error === "string") {
        throw new ValidationError(parsed.error);
      }

      return parsed;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

/** Custom error class for document validation failures */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: ["API key not configured"],
        warnings: ["Please add your Gemini API key to .env.local file"],
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: ["No file provided"],
        warnings: [],
      });
    }

    // Validate file type
    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: [],
        warnings: ["Please upload a PDF file."],
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check file size (Gemini inline limit is 4MB)
    if (buffer.length > MAX_PDF_SIZE) {
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: [],
        warnings: ["File is too large. Please upload a PDF smaller than 4 MB."],
      });
    }

    // Check for essentially empty files
    if (buffer.length < 100) {
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: [],
        warnings: [
          "The uploaded file appears to be empty or corrupted. Please upload a valid resume PDF.",
        ],
      });
    }

    // Parse resume with Gemini AI (PDF sent directly — no pdf-parse needed)
    let parsedData: ParsedResumeData;
    try {
      parsedData = await parseResumeWithGemini(genAI, buffer);
    } catch (error) {
      // Validation errors get a clean 400 response
      if (error instanceof ValidationError) {
        return NextResponse.json({
          success: false,
          extractedData: {},
          confidence: 0,
          missingFields: [],
          warnings: [error.message],
          validationError: error.message,
        });
      }

      console.error("Gemini parsing error:", error);
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: [],
        warnings: [
          error instanceof Error
            ? error.message
            : "Failed to parse resume with AI. Please try again.",
        ],
      });
    }

    // Build missing fields list
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!parsedData.academic?.cgpa) missingFields.push("CGPA");
    if (!parsedData.academic?.tenthPercentage)
      missingFields.push("10th Percentage");
    if (!parsedData.academic?.twelfthPercentage)
      missingFields.push("12th Percentage");

    if (parsedData.technical?.technicalSkills?.length === 0) {
      warnings.push("No technical skills detected");
    }

    // Build extracted data object (only include non-null values)
    const academicData: Record<string, unknown> = {
      degreeBranch: parsedData.academic?.degreeBranch || "Other",
    };
    if (parsedData.academic?.cgpa) academicData.cgpa = parsedData.academic.cgpa;
    if (parsedData.academic?.tenthPercentage)
      academicData.tenthPercentage = parsedData.academic.tenthPercentage;
    if (parsedData.academic?.twelfthPercentage)
      academicData.twelfthPercentage = parsedData.academic.twelfthPercentage;
    if (parsedData.academic?.backlogs !== undefined)
      academicData.backlogs = parsedData.academic.backlogs;

    const extractedData = {
      academic: academicData,
      technical: {
        technicalSkills: parsedData.technical?.technicalSkills || [],
        dsaLevel: parsedData.technical?.dsaLevel || "None",
        projectsCount: parsedData.technical?.projectsCount || 0,
        hasInternship: parsedData.technical?.hasInternship || false,
        certifications: parsedData.technical?.certifications || [],
      },
      experience: {
        hackathonsCount: parsedData.experience?.hackathonsCount || 0,
        hasOpenSourceContributions:
          parsedData.experience?.hasOpenSourceContributions || false,
        resumeATSScore: parsedData.experience?.resumeATSScore || 50,
      },
    };

    // Calculate confidence based on how much data was extracted
    const totalFields = 12;
    const filledFields = [
      parsedData.academic?.cgpa,
      parsedData.academic?.tenthPercentage,
      parsedData.academic?.twelfthPercentage,
      (parsedData.technical?.technicalSkills?.length || 0) > 0,
      parsedData.technical?.dsaLevel &&
        parsedData.technical.dsaLevel !== "None",
      (parsedData.technical?.projectsCount || 0) > 0,
      parsedData.technical?.hasInternship,
      (parsedData.technical?.certifications?.length || 0) > 0,
      (parsedData.experience?.hackathonsCount || 0) > 0,
      parsedData.experience?.hasOpenSourceContributions,
      (parsedData.experience?.resumeATSScore || 0) > 0,
    ].filter(Boolean).length;

    const confidence = Math.round((filledFields / totalFields) * 100);

    return NextResponse.json({
      success: true,
      extractedData,
      confidence,
      missingFields,
      warnings,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({
      success: false,
      extractedData: {},
      confidence: 0,
      missingFields: [],
      warnings: [
        error instanceof Error ? error.message : "Failed to parse resume",
      ],
    });
  }
}
