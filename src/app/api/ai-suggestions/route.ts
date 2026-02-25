import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type {
  CandidateProfile,
  PlacementPrediction,
} from "@/lib/types/placement";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AISuggestionsRequest {
  profile: CandidateProfile;
  prediction: PlacementPrediction;
}

interface AISuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

/** Gemini models to try, in order of preference. */
const MODEL_NAMES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro",
];

async function tryWithModels(prompt: string): Promise<string | null> {
  for (const modelName of MODEL_NAMES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch {}
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { profile, prediction }: AISuggestionsRequest = await request.json();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile is required" },
        { status: 400 },
      );
    }

    const prompt = `You are a career counselor AI assistant for software development placements. Analyze this candidate's profile and provide personalized, actionable suggestions to improve their placement chances.

CANDIDATE PROFILE:
- Target Role: Software Developer
- Placement Probability: ${prediction.probability}%
- Risk Category: ${prediction.riskCategory}

ACADEMICS:
- CGPA: ${profile.academic?.cgpa ?? "Not provided"}/10
- 10th Percentage: ${profile.academic?.tenthPercentage ?? "Not provided"}%
- 12th Percentage: ${profile.academic?.twelfthPercentage ?? "Not provided"}%
- Degree Branch: ${profile.academic?.degreeBranch || "Not provided"}
- Backlogs: ${profile.academic?.backlogs ?? 0}

TECHNICAL SKILLS:
- Skills: ${profile.technical?.technicalSkills?.join(", ") || "None listed"}
- DSA Level: ${profile.technical?.dsaLevel || "Not provided"}
- Projects: ${profile.technical?.projectsCount ?? 0}
- Certifications: ${profile.technical?.certifications?.join(", ") || "None"}
- Has Internship: ${profile.technical?.hasInternship ? "Yes" : "No"}

EXPERIENCE & SOFT SKILLS:
- Hackathons: ${profile.experience?.hackathonsCount ?? 0}
- Open Source Contributions: ${profile.experience?.hasOpenSourceContributions ? "Yes" : "No"}
- Communication Score: ${profile.softSkills?.communicationScore ?? "Not provided"}/10
- Aptitude Score: ${profile.softSkills?.aptitudeScore ?? "Not provided"}/100
- Mock Interview Score: ${profile.softSkills?.mockInterviewScore ?? "Not provided"}/10

IDENTIFIED WEAKNESSES:
${prediction.weaknesses.map((w) => `- ${w.area}: ${w.currentValue} -> Target: ${w.targetValue} (${w.priority} priority)`).join("\n") || "None identified"}

IDENTIFIED STRENGTHS:
${prediction.strengths.map((s) => `- ${s.area}: ${s.value} (${s.impact} impact)`).join("\n") || "None identified"}

Based on this analysis, provide exactly 4 personalized suggestions. Each suggestion should be specific, actionable, and directly address the candidate's weaknesses or help leverage their strengths.

Return your response as a JSON array with this exact format (no markdown, just pure JSON):
[
  {
    "title": "Short suggestion title (3-5 words)",
    "description": "Detailed actionable advice in 2-3 sentences explaining what to do and why it helps.",
    "priority": "high" | "medium" | "low"
  }
]

Focus on:
1. The most critical improvements first
2. Specific resources, courses, or actions they can take
3. Realistic goals they can achieve in 1-3 months
4. How each suggestion directly impacts their placement chances`;

    const text = await tryWithModels(prompt);

    if (!text) {
      // Fallback suggestions if AI fails
      return NextResponse.json({
        suggestions: generateFallbackSuggestions(profile, prediction),
      });
    }

    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions: AISuggestion[] = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ suggestions });
      }
      throw new Error("Invalid response format");
    } catch {
      // Parse error - return fallback
      return NextResponse.json({
        suggestions: generateFallbackSuggestions(profile, prediction),
      });
    }
  } catch (error) {
    console.error("AI Suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 },
    );
  }
}

function generateFallbackSuggestions(
  profile: CandidateProfile,
  prediction: PlacementPrediction,
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Based on weaknesses
  for (const weakness of prediction.weaknesses.slice(0, 4)) {
    if (weakness.area.toLowerCase().includes("dsa")) {
      suggestions.push({
        title: "Master DSA Fundamentals",
        description:
          "Practice on LeetCode or HackerRank daily. Focus on arrays, strings, trees, and dynamic programming. Aim to solve 100+ problems in 2 months.",
        priority: "high",
      });
    } else if (weakness.area.toLowerCase().includes("project")) {
      suggestions.push({
        title: "Build Portfolio Projects",
        description:
          "Create 2-3 full-stack projects showcasing different technologies. Deploy them on Vercel/Netlify and host code on GitHub with proper documentation.",
        priority: "high",
      });
    } else if (weakness.area.toLowerCase().includes("internship")) {
      suggestions.push({
        title: "Secure an Internship",
        description:
          "Apply to internships on LinkedIn, Internshala, and company career pages. Even short-term or remote internships add valuable experience.",
        priority: "high",
      });
    } else if (weakness.area.toLowerCase().includes("certification")) {
      suggestions.push({
        title: "Get Industry Certifications",
        description:
          "Pursue AWS/Azure cloud certifications or courses from Coursera/Udemy. These validate your skills and stand out on resumes.",
        priority: "medium",
      });
    }
  }

  // Fill remaining slots
  while (suggestions.length < 4) {
    if (!suggestions.some((s) => s.title.includes("GitHub"))) {
      suggestions.push({
        title: "Strengthen GitHub Profile",
        description:
          "Maintain consistent commit history, contribute to open source, and showcase your best projects with detailed READMEs.",
        priority: "medium",
      });
    } else if (!suggestions.some((s) => s.title.includes("Communication"))) {
      suggestions.push({
        title: "Improve Communication Skills",
        description:
          "Practice mock interviews, join toastmasters, or take online communication courses. Clear communication is key in interviews.",
        priority: "medium",
      });
    } else {
      suggestions.push({
        title: "Network Actively",
        description:
          "Connect with professionals on LinkedIn, attend tech meetups, and participate in hackathons to expand your network.",
        priority: "low",
      });
    }
  }

  return suggestions.slice(0, 4);
}
