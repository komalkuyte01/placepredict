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

const RESUME_PARSE_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume content and extract structured information that would be relevant for placement/hiring processes.

## Fields to Extract:

Looking for these specific data fields from the resume:

1. **Academic Information:**
   - CGPA/GPA (scale 0-10)
   - 10th/SSC/Secondary percentage
   - 12th/HSC/Higher Secondary percentage
   - Degree Branch (Computer Science, Information Technology, Electronics, Electrical, Mechanical, Civil, or Other)
   - Active Backlogs count

2. **Technical Skills:**
   - Technical Skills (Programming languages, frameworks, tools, databases, cloud platforms, etc.)
   - DSA/Algorithm proficiency level
   - Number of projects
   - Internship experience (yes/no)
   - Certifications

3. **Experience & ATS Score:**
   - Hackathon participation count
   - Open source contributions (yes/no)
   - Resume ATS Score (0-100)

Return a JSON object with this EXACT structure (use null for fields not found):

{
  "academic": {
    "cgpa": <number 0-10 or null>,
    "tenthPercentage": <number 0-100 or null>,
    "twelfthPercentage": <number 0-100 or null>,
    "degreeBranch": <"Computer Science" | "Information Technology" | "Electronics" | "Electrical" | "Mechanical" | "Civil" | "Other">,
    "backlogs": <number or 0>
  },
  "technical": {
    "technicalSkills": [<array of ALL technical skills: programming languages, frameworks, libraries, databases, tools, cloud platforms, etc.>],
    "dsaLevel": <"None" | "Basic" | "Intermediate" | "Advanced">,
    "projectsCount": <number of projects mentioned>,
    "hasInternship": <true if internship experience mentioned>,
    "certifications": [<array of certifications found>]
  },
  "experience": {
    "hackathonsCount": <number of hackathons participated>,
    "hasOpenSourceContributions": <true if open source contributions mentioned>,
    "resumeATSScore": <ATS compatibility score 0-100>
  }
}

## DSA Level Guidelines:
- "Advanced": Competitive programming, LeetCode hard problems, advanced DP, graph algorithms, segment trees, CodeForces/CodeChef ratings
- "Intermediate": Data structures, algorithms, trees, graphs, LeetCode medium, basic DP
- "Basic": Basic programming, arrays, strings, loops, simple sorting
- "None": No DSA/algorithm mentions

## ATS Score Calculation Guidelines (0-100):
Calculate based on these factors:
- Clear formatting & structure: +15 points
- Relevant keywords for tech roles: +20 points
- Quantified achievements: +15 points
- Action verbs usage: +10 points
- No spelling/grammar errors: +10 points
- Proper sections (Education, Experience, Skills, Projects): +15 points
- Contact information present: +5 points
- Appropriate length (1-2 pages): +5 points
- Technical skills clearly listed: +5 points

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks, no explanation
- Use proper capitalization ("JavaScript", "Python", "React", "AWS", "Docker")
- Extract ALL technical skills: languages, frameworks, libraries, databases, tools, cloud platforms, DevOps tools, etc.
- Count ALL projects mentioned (personal, academic, professional)
- Look for CGPA, GPA, percentage marks in education section
- If field not found, use null for numbers and [] for arrays

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
 * Available Gemini model names to try (in order of preference)
 */
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro",
];

/**
 * Parse resume using Gemini AI with the PDF sent directly as file
 */
async function parseResumeWithGemini(
  genAI: GoogleGenerativeAI,
  fileBuffer: Buffer,
  mimeType: string,
  extractedText?: string,
): Promise<ParsedResumeData> {
  let lastError: Error | null = null;

  // Try each model until one works
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
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

      console.log(`Successfully used model: ${modelName}`);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.log(`Model ${modelName} failed:`, error instanceof Error ? error.message : error);
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next model
    }
  }

  throw lastError || new Error("All Gemini models failed");
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
