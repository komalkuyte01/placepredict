import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface RelevanceCheckRequest {
  skills: string[];
  certifications: string[];
}

interface IrrelevantItem {
  type: "skill" | "certification";
  name: string;
  reason: string;
}

// Known relevant tech skills/keywords (case-insensitive matching)
const RELEVANT_KEYWORDS = [
  // Programming languages
  "java",
  "python",
  "javascript",
  "typescript",
  "c++",
  "c#",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "perl",
  "r",
  "matlab",
  "sql",
  "html",
  "css",
  "sass",
  "scss",
  "less",
  // Frameworks/Libraries
  "react",
  "angular",
  "vue",
  "svelte",
  "next",
  "nuxt",
  "express",
  "node",
  "django",
  "flask",
  "fastapi",
  "spring",
  "hibernate",
  "laravel",
  "rails",
  "asp.net",
  ".net",
  "dotnet",
  "jquery",
  "bootstrap",
  "tailwind",
  "material",
  "redux",
  "mobx",
  "graphql",
  "rest",
  "api",
  // Databases
  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "redis",
  "elasticsearch",
  "cassandra",
  "dynamodb",
  "firebase",
  "supabase",
  "oracle",
  "sql server",
  "sqlite",
  "neo4j",
  "mariadb",
  // Cloud/DevOps
  "aws",
  "azure",
  "gcp",
  "google cloud",
  "docker",
  "kubernetes",
  "k8s",
  "terraform",
  "ansible",
  "jenkins",
  "ci/cd",
  "github actions",
  "gitlab",
  "circleci",
  "travis",
  "heroku",
  "vercel",
  "netlify",
  "cloudflare",
  "nginx",
  "apache",
  "linux",
  "unix",
  "bash",
  "shell",
  "powershell",
  // Tools
  "git",
  "github",
  "gitlab",
  "bitbucket",
  "jira",
  "confluence",
  "slack",
  "figma",
  "postman",
  "swagger",
  "openapi",
  "webpack",
  "vite",
  "babel",
  "eslint",
  "prettier",
  "npm",
  "yarn",
  "pnpm",
  "maven",
  "gradle",
  // Testing
  "jest",
  "mocha",
  "chai",
  "cypress",
  "selenium",
  "playwright",
  "testing",
  "unit test",
  "integration test",
  "tdd",
  "bdd",
  "junit",
  "pytest",
  "rspec",
  // Concepts
  "agile",
  "scrum",
  "kanban",
  "microservices",
  "serverless",
  "machine learning",
  "ml",
  "ai",
  "deep learning",
  "data science",
  "data analytics",
  "big data",
  "hadoop",
  "spark",
  "kafka",
  "blockchain",
  "web3",
  "dsa",
  "data structures",
  "algorithms",
  "oop",
  "functional programming",
  "design patterns",
  "system design",
  "software architecture",
  // Certifications
  "aws certified",
  "azure certified",
  "google certified",
  "comptia",
  "cisco",
  "ccna",
  "ccnp",
  "pmp",
  "scrum master",
  "csm",
  "oracle certified",
  "salesforce",
  "linux+",
  "security+",
  "network+",
  "cka",
  "ckad",
  "solutions architect",
  "developer associate",
  "sysops",
  "devops engineer",
];

function isLikelyGibberish(text: string): boolean {
  const cleaned = text.toLowerCase().trim();
  // Too short
  if (cleaned.length < 2) return true;
  // All same character
  if (new Set(cleaned.replace(/\s/g, "")).size <= 2 && cleaned.length > 3)
    return true;
  // No vowels (likely gibberish)
  if (!/[aeiou]/i.test(cleaned) && cleaned.length > 4) return true;
  // Mostly non-alphabetic
  const alphaCount = (cleaned.match(/[a-z]/gi) || []).length;
  if (alphaCount < cleaned.length * 0.5 && cleaned.length > 3) return true;
  // Common gibberish patterns
  if (/^[a-z]{1,2}$/i.test(cleaned)) return true; // Single/double letters
  if (/^(.)\1+$/i.test(cleaned)) return true; // Repeated single char
  if (/^[^aeiou]+$/i.test(cleaned) && cleaned.length > 3) return true; // No vowels
  return false;
}

function isRelevantToSoftwareDev(text: string): boolean {
  const cleaned = text.toLowerCase().trim();

  // Check against known keywords
  for (const keyword of RELEVANT_KEYWORDS) {
    if (cleaned.includes(keyword) || keyword.includes(cleaned)) {
      return true;
    }
  }

  // Check for common tech patterns
  if (/\.(js|ts|py|java|cpp|cs|go|rb|php|swift|kt)$/i.test(cleaned))
    return true;
  if (/v?\d+(\.\d+)*/.test(cleaned) && cleaned.length < 20) return true; // Version numbers like "node v18"

  return false;
}

function localRelevanceCheck(
  skills: string[],
  certifications: string[],
): IrrelevantItem[] {
  const issues: IrrelevantItem[] = [];

  for (const skill of skills) {
    if (isLikelyGibberish(skill)) {
      issues.push({
        type: "skill",
        name: skill,
        reason: "This doesn't appear to be a valid skill name",
      });
    } else if (!isRelevantToSoftwareDev(skill)) {
      issues.push({
        type: "skill",
        name: skill,
        reason: "This skill may not be relevant to software development",
      });
    }
  }

  for (const cert of certifications) {
    if (isLikelyGibberish(cert)) {
      issues.push({
        type: "certification",
        name: cert,
        reason: "This doesn't appear to be a valid certification name",
      });
    } else if (!isRelevantToSoftwareDev(cert)) {
      issues.push({
        type: "certification",
        name: cert,
        reason:
          "This certification may not be relevant to software development",
      });
    }
  }

  return issues;
}

/** Gemini models to try, in order of preference. */
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro",
];

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
- Non-technical skills unrelated to software (e.g., cooking, driving, sports, gardening)
- Non-technical certifications (e.g., cooking, driving license, fitness, medical, legal, accounting)
- Vague or meaningless entries (e.g., "good", "nice", single letters)

Mark items as RELEVANT (do NOT include in irrelevant list):
- Programming languages (Python, Java, JavaScript, C++, etc.)
- Frameworks and libraries (React, Angular, Node.js, Django, Spring, etc.)
- Databases (MySQL, PostgreSQL, MongoDB, etc.)
- Cloud services (AWS, Azure, GCP certifications)
- DevOps tools (Docker, Kubernetes, Jenkins, etc.)
- Version control (Git, GitHub)
- Testing tools and methodologies
- Any legitimate tech skill or certification

Respond ONLY in this exact JSON format with no additional text:
{
  "irrelevant": [
    {"type": "skill", "name": "exact name", "reason": "brief reason"},
    {"type": "certification", "name": "exact name", "reason": "brief reason"}
  ]
}

If all items are legitimate and relevant, respond with:
{"irrelevant": []}`;

    // Try each model until one works
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]);

        const issues: IrrelevantItem[] = (parsed.irrelevant || []).map(
          (item: { type: string; name: string; reason: string }) => ({
            type: item.type as "skill" | "certification",
            name: item.name,
            reason: item.reason,
          }),
        );

        return NextResponse.json({ issues });
      } catch {}
    }

    // All models failed — use local fallback
    const localIssues = localRelevanceCheck(skills, certifications);
    return NextResponse.json({ issues: localIssues });
  } catch (error) {
    console.error("Error checking relevance:", error);
    // Use local fallback on any error
    try {
      const body = await request.clone().json();
      const localIssues = localRelevanceCheck(
        body.skills || [],
        body.certifications || [],
      );
      return NextResponse.json({ issues: localIssues });
    } catch {
      return NextResponse.json({ issues: [] });
    }
  }
}
