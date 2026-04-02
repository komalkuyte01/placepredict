import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeA = formData.get("resumeA") as File | null;
    const resumeB = formData.get("resumeB") as File | null;

    if (!resumeA || !resumeB) {
      return NextResponse.json(
        { error: "Both resume versions are required" },
        { status: 400 },
      );
    }

    const pdfParse = (await import("pdf-parse")).default;
    const bufferA = Buffer.from(await resumeA.arrayBuffer());
    const parsedA = await pdfParse(bufferA);
    const bufferB = Buffer.from(await resumeB.arrayBuffer());
    const parsedB = await pdfParse(bufferB);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert resume advisor and career counselor.

TASK: Compare these two resume versions and determine which is better for software developer job applications.

RESUME VERSION A:
${parsedA.text}

RESUME VERSION B:
${parsedB.text}

Analyze and return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "winner": "A|B|tie",
  "winnerReason": "<2-3 sentence explanation of why one version is better>",
  "scoreA": <number 0-100>,
  "scoreB": <number 0-100>,
  "categories": [
    {"category": "Format & Layout", "scoreA": <0-20>, "scoreB": <0-20>, "maxScore": 20, "winner": "A|B|tie"},
    {"category": "Content & Keywords", "scoreA": <0-20>, "scoreB": <0-20>, "maxScore": 20, "winner": "A|B|tie"},
    {"category": "Experience & Projects", "scoreA": <0-20>, "scoreB": <0-20>, "maxScore": 20, "winner": "A|B|tie"},
    {"category": "Skills Presentation", "scoreA": <0-20>, "scoreB": <0-20>, "maxScore": 20, "winner": "A|B|tie"},
    {"category": "Impact & Quantification", "scoreA": <0-20>, "scoreB": <0-20>, "maxScore": 20, "winner": "A|B|tie"}
  ],
  "strengthsA": ["<unique strengths of version A>"],
  "strengthsB": ["<unique strengths of version B>"],
  "recommendation": "<detailed recommendation on which to use and what to combine>"
}

Rules:
- Be thorough and compare every section
- Consider ATS compatibility, readability, impact, and professionalism
- strengthsA/B: list 3-5 unique strengths for each version
- recommendation: provide actionable advice on which version to use and what elements to combine`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      parsed = {
        winner: "tie",
        winnerReason: "Unable to parse detailed comparison. Please try again.",
        scoreA: 50,
        scoreB: 50,
        categories: [],
        strengthsA: [],
        strengthsB: [],
        recommendation: responseText,
      };
    }

    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error("Resume Comparison error:", error);
    return NextResponse.json({ error: "Comparison failed" }, { status: 500 });
  }
}
