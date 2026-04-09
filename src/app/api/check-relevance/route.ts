import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ml/gemini";

interface RelevanceCheckRequest {
  skills: string[];
  certifications: string[];
}

interface IrrelevantItem {
  type: "skill" | "certification";
  name: string;
  reason: string;
}

export async function POST(request: Request) {
  try {
    const body: RelevanceCheckRequest = await request.json();
    const { skills, certifications } = body;

    if (
      (!skills || skills.length === 0) &&
      (!certifications || certifications.length === 0)
    ) {
      return NextResponse.json({ issues: [] });
    }

    const prompt = `You are an expert tech recruiter evaluating skills and certifications for a Software Developer role.

Analyze the following skills and certifications and identify which ones are NOT relevant or NOT VALID for a Software Developer position.

Skills: ${skills.length > 0 ? skills.join(", ") : "None provided"}
Certifications: ${certifications.length > 0 ? certifications.join(", ") : "None provided"}

For each IRRELEVANT or INVALID item, provide:
1. The type (skill or certification)
2. The exact name as provided
3. A brief reason why it's not relevant/valid for a Software Developer role

Mark items as IRRELEVANT if they are:
- Gibberish or random characters (e.g., "dfsf", "asdf", "xyz123")
- Misspelled to the point of being unrecognizable
- Non-technical skills completely unrelated to software (e.g., cooking, driving, sports, gardening)
- Non-technical certifications (e.g., cooking, driving license, fitness, medical, legal, accounting)
- Vague or meaningless entries (e.g., "good", "nice")

Mark items as RELEVANT (do NOT include in irrelevant list) — these are ALL valid:
- ALL programming languages, even short ones like C, R, Go, D, F#, etc.
- ALL frameworks and libraries (React, Angular, Node.js, Django, Spring, Zustand, Jotai, Recoil, etc.)
- ALL databases (MySQL, PostgreSQL, MongoDB, SQLite, Redis, etc.)
- ALL markup/styling languages (HTML, CSS, SASS, SCSS, HTML/CSS, etc.)
- Cloud services (AWS, Azure, GCP certifications)
- DevOps tools (Docker, Kubernetes, Jenkins, etc.)
- Version control (Git, GitHub)
- Testing tools and methodologies
- State management libraries (Redux, MobX, Zustand, Jotai, Recoil, Pinia, NgRx, etc.)
- Build tools (Webpack, Vite, Babel, etc.)
- Any legitimate tech skill, tool, library, or certification related to software development

IMPORTANT: Do NOT flag legitimate programming languages, frameworks, libraries, databases, or any real tech skill as irrelevant. Even single-letter or short-name languages (C, R, Go, D) are valid. Compound skills like "HTML/CSS" are valid.

Respond ONLY in this exact JSON format with no additional text:
{
  "irrelevant": [
    {"type": "skill", "name": "exact name", "reason": "brief reason"},
    {"type": "certification", "name": "exact name", "reason": "brief reason"}
  ]
}

If all items are legitimate and relevant, respond with:
{"irrelevant": []}`;

    try {
      const text = await generateWithFallback([prompt]);

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ issues: [] });
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const issues: IrrelevantItem[] = (parsed.irrelevant || []).map(
        (item: { type: string; name: string; reason: string }) => ({
          type: item.type as "skill" | "certification",
          name: item.name,
          reason: item.reason,
        }),
      );

      return NextResponse.json({ issues });
    } catch (error) {
      console.warn("Relevance check failed:", error);
      return NextResponse.json({ issues: [] });
    }
  } catch (error) {
    console.error("Error checking relevance:", error);
    return NextResponse.json({ issues: [] });
  }
}
