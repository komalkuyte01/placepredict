import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

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

    const { PDFParse } = await import("pdf-parse");

    // Extract text from files
    let jdContent = jdText?.trim() || "";
    if (jdFile) {
      const jdParser = new PDFParse({
        data: new Uint8Array(await jdFile.arrayBuffer()),
      });
      const jdResult = await jdParser.getText();
      jdContent = jdResult.text;
      await jdParser.destroy();
    }

    const resumeParser = new PDFParse({
      data: new Uint8Array(await resumeFile.arrayBuffer()),
    });
    const resumeResult = await resumeParser.getText();
    const resumeContent = resumeResult.text;
    await resumeParser.destroy();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert talent acquisition specialist and resume analyzer.

TASK: Compare the following resume against the job description and provide a detailed match analysis.

JOB DESCRIPTION:
${jdContent}

RESUME:
${resumeContent}

Analyze and return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

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
  } catch (error) {
    console.error("JD Matching error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
