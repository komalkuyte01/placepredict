"use server";

import type {
  CandidateProfile,
  DegreeBranch,
  DSALevel,
  ResumeParseResult,
} from "@/lib/types/placement";

/**
 * Keywords for skill detection.
 */
const PROGRAMMING_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "go",
  "rust",
  "kotlin",
  "swift",
  "php",
  "scala",
  "r",
  "matlab",
  "perl",
  "html",
  "css",
  "sql",
  "bash",
  "shell",
  "powershell",
  "c",
  "objective-c",
  "dart",
  "lua",
  "haskell",
  "elixir",
  "clojure",
  "f#",
  "assembly",
  "react",
  "angular",
  "vue",
  "node.js",
  "nodejs",
  "express",
  "django",
  "flask",
  "spring",
  "springboot",
  "spring boot",
  "laravel",
  "rails",
  "nextjs",
  "next.js",
  "remix",
  "svelte",
  "mongodb",
  "postgresql",
  "mysql",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "git",
  "linux",
];

const LANGUAGE_CAPITALIZATION: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  "c++": "C++",
  "c#": "C#",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  kotlin: "Kotlin",
  swift: "Swift",
  php: "PHP",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  "node.js": "Node.js",
  nodejs: "Node.js",
  react: "React",
  angular: "Angular",
  vue: "Vue.js",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  docker: "Docker",
  kubernetes: "Kubernetes",
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
  git: "Git",
  linux: "Linux",
  django: "Django",
  flask: "Flask",
  spring: "Spring",
  springboot: "Spring Boot",
  express: "Express",
  nextjs: "Next.js",
  "next.js": "Next.js",
};

const DSA_KEYWORDS = {
  advanced: [
    "dynamic programming",
    "dp",
    "graph algorithms",
    "segment tree",
    "fenwick",
    "trie",
    "dijkstra",
    "backtracking",
    "competitive programming",
    "leetcode hard",
    "codeforces",
  ],
  intermediate: [
    "binary search",
    "sorting",
    "linked list",
    "stack",
    "queue",
    "tree",
    "bfs",
    "dfs",
    "recursion",
    "hashing",
    "heap",
    "leetcode medium",
  ],
  basic: [
    "array",
    "string",
    "data structure",
    "algorithms",
    "leetcode easy",
    "hackerrank",
  ],
};

const INTERNSHIP_KEYWORDS = [
  "intern",
  "internship",
  "trainee",
  "apprentice",
  "co-op",
];
const HACKATHON_KEYWORDS = [
  "hackathon",
  "hack-a-thon",
  "coding competition",
  "devfolio",
  "mlh",
];
const OPEN_SOURCE_KEYWORDS = [
  "open source",
  "open-source",
  "github contribution",
  "pull request",
  "gsoc",
  "hacktoberfest",
];
const _CERTIFICATION_KEYWORDS = [
  "certificate",
  "certified",
  "certification",
  "coursera",
  "udemy",
  "aws certified",
  "google certified",
  "nptel",
];

const BRANCH_KEYWORDS: Record<DegreeBranch, string[]> = {
  "Computer Science": [
    "computer science",
    "cse",
    "cs",
    "computer engineering",
    "software engineering",
  ],
  "Information Technology": [
    "information technology",
    "it",
    "information systems",
  ],
  Electronics: ["electronics", "ece", "eee"],
  Electrical: ["electrical engineering", "ee"],
  Mechanical: ["mechanical", "mech"],
  Civil: ["civil engineering", "civil"],
  Other: [],
};

function extractProgrammingLanguages(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  const added = new Set<string>();

  for (const lang of PROGRAMMING_LANGUAGES) {
    if (lowerText.includes(lang)) {
      const cap =
        LANGUAGE_CAPITALIZATION[lang] ||
        lang.charAt(0).toUpperCase() + lang.slice(1);
      if (!added.has(cap)) {
        found.push(cap);
        added.add(cap);
      }
    }
  }
  return found.slice(0, 15);
}

function determineDSALevel(text: string): DSALevel {
  const lowerText = text.toLowerCase();
  for (const keyword of DSA_KEYWORDS.advanced) {
    if (lowerText.includes(keyword)) return "Advanced";
  }
  let count = 0;
  for (const keyword of DSA_KEYWORDS.intermediate) {
    if (lowerText.includes(keyword)) count++;
  }
  if (count >= 3) return "Intermediate";
  if (count >= 1) return "Basic";
  for (const keyword of DSA_KEYWORDS.basic) {
    if (lowerText.includes(keyword)) return "Basic";
  }
  return "None";
}

function countProjects(text: string): number {
  const matches = text.match(
    /project[s]?\s*:?|\bbuilt\b|\bdeveloped\b|\bcreated\b/gi,
  );
  return matches ? Math.min(matches.length, 10) : 0;
}

function extractCGPA(text: string): number | null {
  const patterns = [
    /cgpa\s*[:-]?\s*([\d.]+)/i,
    /gpa\s*[:-]?\s*([\d.]+)/i,
    /([\d.]+)\s*(?:\/\s*10)?\s*cgpa/i,
    /aggregate\s*[:-]?\s*([\d.]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value > 0 && value <= 4.0) return Math.round(value * 2.5 * 10) / 10;
      if (value > 0 && value <= 10) return Math.round(value * 10) / 10;
    }
  }
  return null;
}

function extractPercentage(text: string, type: "10th" | "12th"): number | null {
  const patterns =
    type === "10th"
      ? [
          /10th\s*[:-]?\s*([\d.]+)/i,
          /(?:ssc|secondary)\s*[:-]?\s*([\d.]+)/i,
          /class\s*10\s*[:-]?\s*([\d.]+)/i,
        ]
      : [
          /12th\s*[:-]?\s*([\d.]+)/i,
          /(?:hsc|higher secondary)\s*[:-]?\s*([\d.]+)/i,
          /class\s*12\s*[:-]?\s*([\d.]+)/i,
        ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value > 0 && value <= 100) return Math.round(value * 10) / 10;
    }
  }
  return null;
}

function determineBranch(text: string): DegreeBranch {
  const lowerText = text.toLowerCase();
  for (const [branch, keywords] of Object.entries(BRANCH_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) return branch as DegreeBranch;
    }
  }
  return "Other";
}

function hasKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((k) => lowerText.includes(k));
}

function countKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.filter((k) => lowerText.includes(k)).length;
}

function extractCertifications(text: string): string[] {
  const found: string[] = [];
  const patterns = [
    /aws\s+certified/gi,
    /google\s+certified/gi,
    /coursera\s+certificate/gi,
    /nptel/gi,
  ];
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) found.push(...matches);
  }
  return found.slice(0, 10);
}

function calculateResumeScore(text: string): number {
  let score = 50;
  if (text.toLowerCase().includes("education")) score += 5;
  if (text.toLowerCase().includes("experience")) score += 5;
  if (text.toLowerCase().includes("project")) score += 5;
  if (text.toLowerCase().includes("skill")) score += 5;
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 1000) score += 10;
  if (text.match(/[\w.-]+@[\w.-]+\.\w+/)) score += 5;
  if (text.match(/github|linkedin/i)) score += 5;
  return Math.min(score, 100);
}

/**
 * Server action to parse PDF resume and extract structured data.
 */
export async function parseResumeFromPDF(
  formData: FormData,
): Promise<ResumeParseResult> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: ["No file provided"],
        warnings: [],
      };
    }

    const arrayBuffer = await file.arrayBuffer();

    // Use unpdf to extract text from PDF
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(arrayBuffer));

    if (!text || text.trim().length < 50) {
      return {
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: ["Unable to extract text from PDF"],
        warnings: [
          "Please ensure the PDF contains readable text, not scanned images",
        ],
      };
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];

    const cgpa = extractCGPA(text);
    const tenthPercentage = extractPercentage(text, "10th");
    const twelfthPercentage = extractPercentage(text, "12th");

    if (!cgpa) missingFields.push("CGPA");
    if (!tenthPercentage) missingFields.push("10th Percentage");
    if (!twelfthPercentage) missingFields.push("12th Percentage");

    const programmingLanguages = extractProgrammingLanguages(text);
    const dsaLevel = determineDSALevel(text);
    const projectsCount = countProjects(text);
    const internship = hasKeywords(text, INTERNSHIP_KEYWORDS);
    const certifications = extractCertifications(text);
    const hackathonsCount = countKeywords(text, HACKATHON_KEYWORDS);
    const openSource = hasKeywords(text, OPEN_SOURCE_KEYWORDS);
    const resumeScore = calculateResumeScore(text);
    const degreeBranch = determineBranch(text);

    if (programmingLanguages.length === 0) {
      warnings.push("No programming languages detected");
    }

    const academicData: Partial<CandidateProfile["academic"]> = {
      degreeBranch,
    };
    if (cgpa !== null) academicData.cgpa = cgpa;
    if (tenthPercentage !== null)
      academicData.tenthPercentage = tenthPercentage;
    if (twelfthPercentage !== null)
      academicData.twelfthPercentage = twelfthPercentage;

    const extractedData: Partial<CandidateProfile> = {
      academic: academicData as CandidateProfile["academic"],
      technical: {
        programmingLanguages,
        dsaLevel,
        projectsCount,
        hasInternship: internship,
        certifications,
      },
      experience: {
        hackathonsCount,
        hasOpenSourceContributions: openSource,
        resumeScore,
      },
    };

    const totalFields = 12;
    const filledFields = [
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      programmingLanguages.length > 0,
      dsaLevel !== "None",
      projectsCount > 0,
      internship,
      certifications.length > 0,
      hackathonsCount > 0,
      openSource,
    ].filter(Boolean).length;

    const confidence = Math.round((filledFields / totalFields) * 100);

    return {
      success: true,
      extractedData,
      confidence,
      missingFields,
      warnings,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    return {
      success: false,
      extractedData: {},
      confidence: 0,
      missingFields: [],
      warnings: [
        error instanceof Error ? error.message : "Failed to parse PDF",
      ],
    };
  }
}
