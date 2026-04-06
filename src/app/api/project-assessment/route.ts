import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ml/gemini";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectDescription, techStack } = body;

    if (!projectDescription?.trim()) {
      return NextResponse.json(
        { error: "Project description is required" },
        { status: 400 },
      );
    }

    const prompt = `You are an expert software engineering interviewer and project evaluator.

TASK: Evaluate the following project for a software developer placement/job application.

PROJECT NAME: ${projectName || "Not specified"}
PROJECT DESCRIPTION: ${projectDescription}
TECH STACK: ${techStack || "Not specified"}

Analyze and return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "score": <number 1-10>,
  "complexityRating": "Low|Medium|High|Very High",
  "relevanceRating": "Low|Medium|High|Very High",
  "skillsCovered": ["<skills demonstrated by this project>"],
  "strengths": ["<what's good about this project>"],
  "suggestions": ["<how to improve this project>"],
  "recruiterTips": ["<how to present this project to impress recruiters>"]
}

Rules:
- Score 1-10 based on complexity, relevance to SDE roles, and impressiveness
- skillsCovered: list all technical skills this project demonstrates (programming languages, frameworks, concepts like REST APIs, authentication, etc.)
- strengths: 3-5 things that are impressive about this project
- suggestions: 3-5 specific improvements to make it more impressive
- recruiterTips: 3-5 ways to present/describe this project to impress recruiters
- Be realistic but constructive in scoring`;

    const responseText = await generateWithFallback(genAI, [prompt]);

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      parsed = {
        score: 5,
        complexityRating: "Medium",
        relevanceRating: "Medium",
        skillsCovered: [],
        strengths: [],
        suggestions: ["Unable to parse detailed results. Please try again."],
        recruiterTips: [],
      };
    }

    return NextResponse.json({ result: parsed });
  } catch (error: unknown) {
    console.error("Project Assessment error:", error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errMessage || "Assessment failed" },
      { status: errMessage.includes("Quota") ? 429 : 500 },
    );
  }
}
