import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ml/gemini";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jdFile = formData.get("jd") as File | null;
    const jdText = formData.get("jdText") as string | null;
    const resumeFile = formData.get("resume") as File | null;

    if ((!jdFile && !jdText?.trim()) || !resumeFile) {
      return NextResponse.json(
        { error: "Job description and resume are required" },
        { status: 400 },
      );
    }

    // Prepare parts
    const promptParts: (string | Part)[] = [
      "You are an expert talent acquisition specialist and resume analyzer.\n\n",
      "TASK: Compare the following resume against the job description and provide a detailed match analysis.\n\n",
      "JOB DESCRIPTION:\n",
    ];

    if (jdFile) {
      const jdBuffer = Buffer.from(await jdFile.arrayBuffer());
      promptParts.push({
        inlineData: {
          data: jdBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      });
    } else {
      promptParts.push(jdText?.trim() || "");
    }

    promptParts.push("\n\nRESUME:\n");
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    promptParts.push({
      inlineData: {
        data: resumeBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    });

    const instructions = `\n\nAnalyze and return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 0-100>,
  "missingSkills": [{"skill": "<skill name>", "importance": "high|medium|low"}],
  "missingExperience": ["<experience/project types missing>"],
  "experienceMismatch": "<null or string describing years mismatch if JD requires specific experience>",
  "matchingSkills": ["<skills that match>"],
  "keywordCoverage": <number 0-100>,
  "suggestions": ["<actionable suggestions>"],
  "detailedAnalysis": "<2-3 paragraph detailed analysis>"
}

Rules:
- Be thorough in identifying ALL missing skills from the JD
- Check for experience year requirements vs what resume shows
- Rate missing skills by importance to the role
- Provide actionable suggestions
- keywordCoverage = percentage of JD keywords found in resume`;

    promptParts.push(instructions);

    const responseText = await generateWithFallback(genAI, promptParts);

    // Parse JSON from response
    let parsed: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      parsed = {
        overallScore: 50,
        missingSkills: [],
        missingExperience: [],
        experienceMismatch: null,
        matchingSkills: [],
        keywordCoverage: 50,
        suggestions: ["Unable to parse detailed results. Please try again."],
        detailedAnalysis: responseText,
      };
    }

    return NextResponse.json({ result: parsed });
  } catch (error: unknown) {
    console.error("JD Matching error:", error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errMessage || "Analysis failed" },
      { status: errMessage.includes("Quota") ? 429 : 500 },
    );
  }
}
