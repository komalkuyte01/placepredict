import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ml/gemini";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume") as File | null;

    if (!resumeFile) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeFilePart: Part = {
      inlineData: {
        data: resumeBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    };

    const promptText = `You are an expert ATS (Applicant Tracking System) analyst and resume advisor.

TASK: Analyze the following resume for ATS compatibility and provide a detailed score breakdown.

Analyze and return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "score": <number 0-100>,
  "improving": [{"factor": "<factor name>", "detail": "<why it helps>"}],
  "lowering": [{"factor": "<factor name>", "detail": "<why it hurts>"}],
  "suggestions": ["<actionable suggestions to improve ATS score>"],
  "breakdown": [
    {"category": "Format & Structure", "score": <0-25>, "maxScore": 25},
    {"category": "Keywords & Skills", "score": <0-25>, "maxScore": 25},
    {"category": "Content Quality", "score": <0-25>, "maxScore": 25},
    {"category": "Quantification & Impact", "score": <0-25>, "maxScore": 25}
  ]
}

Rules:
- Score should reflect real ATS compatibility
- Check for: proper headings, consistent formatting, relevant keywords, action verbs, quantified achievements, proper file structure
- improving: list 3-5 factors that are helping the ATS score
- lowering: list 3-5 factors that are hurting the ATS score
- suggestions: list 4-6 specific, actionable improvements
- breakdown scores should sum to the total ATS score`;

    const responseText = await generateWithFallback(genAI, [
      promptText,
      resumeFilePart,
    ]);

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      parsed = {
        score: 50,
        improving: [],
        lowering: [],
        suggestions: ["Unable to parse detailed results. Please try again."],
        breakdown: [],
      };
    }

    return NextResponse.json({ result: parsed });
  } catch (error: unknown) {
    console.error("ATS Score error:", error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errMessage || "Analysis failed" },
      { status: errMessage.includes("Quota") ? 429 : 500 },
    );
  }
}
