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
    programmingLanguages: string[];
    dsaLevel: DSALevel;
    projectsCount: number;
    hasInternship: boolean;
    certifications: string[];
  };
  experience: {
    hackathonsCount: number;
    hasOpenSourceContributions: boolean;
    resumeScore: number;
  };
}

const RESUME_PARSE_PROMPT = `You are an expert resume parser. Analyze the following resume content and extract structured information.

Return a JSON object with the following structure (use null for fields you cannot find):

{
  "academic": {
    "cgpa": <number 0-10 or null>,
    "tenthPercentage": <number 0-100 or null>,
    "twelfthPercentage": <number 0-100 or null>,
    "degreeBranch": <"Computer Science" | "Information Technology" | "Electronics" | "Electrical" | "Mechanical" | "Civil" | "Other">,
    "backlogs": <number or 0>
  },
  "technical": {
    "programmingLanguages": [<array of programming languages/frameworks/tools found>],
    "dsaLevel": <"None" | "Basic" | "Intermediate" | "Advanced" based on DSA/algorithm mentions>,
    "projectsCount": <number of projects mentioned>,
    "hasInternship": <true if internship experience mentioned, false otherwise>,
    "certifications": [<array of certifications found>]
  },
  "experience": {
    "hackathonsCount": <number of hackathons participated>,
    "hasOpenSourceContributions": <true if open source contributions mentioned>,
    "resumeScore": <estimated resume quality score 0-100 based on content richness>
  }
}

DSA Level Guidelines:
- "Advanced": Mentions competitive programming, LeetCode hard, dynamic programming, graph algorithms, segment trees
- "Intermediate": Mentions data structures, algorithms, sorting, searching, trees, LeetCode medium
- "Basic": Basic programming concepts, arrays, strings, loops
- "None": No DSA/algorithm mentions

IMPORTANT: 
- Return ONLY valid JSON, no markdown code blocks, no explanation, no text before or after
- Use proper capitalization for programming languages (e.g., "JavaScript", "Python", "React")
- Extract ALL technical skills mentioned
- Be thorough in counting projects
- Look for education section for academic details (10th/12th can be SSC/HSC, secondary school percentages)
- If you cannot determine a value, use null for numbers and empty array [] for arrays

Resume content:
`;

/**
 * Extract text from PDF buffer using pdf-parse v2
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    await parser.destroy();
    return result.text || "";
  } catch (error) {
    console.error("PDF parse error:", error);
    throw new Error(
      "Failed to extract text from PDF. Please ensure the file is a valid PDF with text content.",
    );
  }
}

/**
 * Parse resume using Gemini AI with the PDF sent directly as file
 */
async function parseResumeWithGemini(
  genAI: GoogleGenerativeAI,
  fileBuffer: Buffer,
  mimeType: string,
  extractedText?: string,
): Promise<ParsedResumeData> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let result: Awaited<ReturnType<typeof model.generateContent>> | undefined;

  // Try with inline data first (for PDFs), fall back to text
  if (mimeType === "application/pdf" && fileBuffer.length < 4 * 1024 * 1024) {
    // Send PDF directly to Gemini (under 4MB limit for inline)
    const filePart: Part = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    };

    try {
      result = await model.generateContent([RESUME_PARSE_PROMPT, filePart]);
    } catch {
      // If direct PDF fails, fall back to extracted text
      if (extractedText) {
        result = await model.generateContent(
          RESUME_PARSE_PROMPT + extractedText,
        );
      } else {
        throw new Error("Could not process PDF");
      }
    }
  } else if (extractedText) {
    // Use extracted text for large files or non-PDFs
    result = await model.generateContent(RESUME_PARSE_PROMPT + extractedText);
  } else {
    throw new Error("No content to process");
  }

  const response = result.response;
  const responseText = response.text();

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

  try {
    return JSON.parse(cleanedResponse);
  } catch {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("Failed to parse AI response");
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "application/pdf";

    // Try to extract text from PDF for fallback
    let extractedText: string | undefined;
    try {
      extractedText = await extractTextFromPDF(buffer);
    } catch {
      // Text extraction failed, will try direct PDF to Gemini
      console.log("Text extraction failed, attempting direct PDF analysis");
    }

    // If no text and file is small, we can still try direct PDF
    if (
      (!extractedText || extractedText.trim().length < 50) &&
      buffer.length > 4 * 1024 * 1024
    ) {
      return NextResponse.json({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: ["Unable to extract text from PDF"],
        warnings: [
          "Please ensure the PDF contains readable text, not scanned images",
        ],
      });
    }

    // Parse resume with Gemini AI
    let parsedData: ParsedResumeData;
    try {
      parsedData = await parseResumeWithGemini(
        genAI,
        buffer,
        mimeType,
        extractedText,
      );
    } catch (error) {
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

    if (parsedData.technical?.programmingLanguages?.length === 0) {
      warnings.push("No programming languages detected");
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
        programmingLanguages: parsedData.technical?.programmingLanguages || [],
        dsaLevel: parsedData.technical?.dsaLevel || "None",
        projectsCount: parsedData.technical?.projectsCount || 0,
        hasInternship: parsedData.technical?.hasInternship || false,
        certifications: parsedData.technical?.certifications || [],
      },
      experience: {
        hackathonsCount: parsedData.experience?.hackathonsCount || 0,
        hasOpenSourceContributions:
          parsedData.experience?.hasOpenSourceContributions || false,
        resumeScore: parsedData.experience?.resumeScore || 50,
      },
    };

    // Calculate confidence based on how much data was extracted
    const totalFields = 12;
    const filledFields = [
      parsedData.academic?.cgpa,
      parsedData.academic?.tenthPercentage,
      parsedData.academic?.twelfthPercentage,
      (parsedData.technical?.programmingLanguages?.length || 0) > 0,
      parsedData.technical?.dsaLevel &&
        parsedData.technical.dsaLevel !== "None",
      (parsedData.technical?.projectsCount || 0) > 0,
      parsedData.technical?.hasInternship,
      (parsedData.technical?.certifications?.length || 0) > 0,
      (parsedData.experience?.hackathonsCount || 0) > 0,
      parsedData.experience?.hasOpenSourceContributions,
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
