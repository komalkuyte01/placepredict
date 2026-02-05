/**
 * Resume Parser for extracting candidate information.
 * Uses pattern matching and NLP-like techniques to extract structured data.
 */

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
  "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go",
  "rust", "kotlin", "swift", "php", "scala", "r", "matlab", "perl",
  "html", "css", "sql", "bash", "shell", "powershell"
];

const DSA_KEYWORDS = {
  advanced: ["dynamic programming", "dp", "graph algorithms", "segment tree", "fenwick", "trie", "red-black", "avl", "dijkstra", "a*", "backtracking"],
  intermediate: ["binary search", "sorting", "linked list", "stack", "queue", "tree", "bfs", "dfs", "recursion", "hashing"],
  basic: ["array", "string", "loop", "condition", "function", "data structure"]
};

const PROJECT_KEYWORDS = [
  "project", "developed", "built", "created", "implemented", "designed",
  "architected", "led development", "full-stack", "frontend", "backend"
];

const INTERNSHIP_KEYWORDS = [
  "intern", "internship", "trainee", "apprentice", "co-op"
];

const HACKATHON_KEYWORDS = [
  "hackathon", "hack-a-thon", "coding competition", "programming contest",
  "devfolio", "mlh", "hackerearth"
];

const OPEN_SOURCE_KEYWORDS = [
  "open source", "open-source", "github contribution", "pull request",
  "pr merged", "contributor", "gsoc", "gssoc", "hacktoberfest"
];

const CERTIFICATION_KEYWORDS = [
  "certificate", "certified", "certification", "credential", "coursera",
  "udemy", "aws certified", "google certified", "microsoft certified",
  "meta certified", "oracle certified"
];

const TIER1_COLLEGES = [
  "iit", "nit", "iiit", "bits", "vit", "manipal", "srm"
];

const TIER2_COLLEGES = [
  "dtu", "nsut", "igdtuw", "rvce", "mit", "pec", "thapar"
];

const BRANCH_KEYWORDS: Record<DegreeBranch, string[]> = {
  "Computer Science": ["computer science", "cse", "cs", "computer engineering", "software engineering"],
  "Information Technology": ["information technology", "it", "information systems"],
  "Electronics": ["electronics", "ece", "eee", "electrical and electronics"],
  "Electrical": ["electrical engineering", "ee", "eee"],
  "Mechanical": ["mechanical", "mech"],
  "Civil": ["civil engineering", "civil"],
  "Other": []
};

/**
 * Extracts text content from file.
 * Supports plain text files for now.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || "");
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Extracts programming languages from text as an array.
 */
function extractProgrammingLanguages(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const lang of PROGRAMMING_LANGUAGES) {
    if (lowerText.includes(lang) && !found.includes(lang)) {
      // Capitalize properly
      found.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }
  
  return found.slice(0, 10); // Cap at 10
}

/**
 * Determines DSA level based on keywords.
 */
function determineDSALevel(text: string): DSALevel {
  const lowerText = text.toLowerCase();
  
  // Check for advanced keywords
  for (const keyword of DSA_KEYWORDS.advanced) {
    if (lowerText.includes(keyword)) {
      return "Advanced";
    }
  }
  
  // Check for intermediate keywords
  let intermediateCount = 0;
  for (const keyword of DSA_KEYWORDS.intermediate) {
    if (lowerText.includes(keyword)) {
      intermediateCount++;
    }
  }
  if (intermediateCount >= 3) {
    return "Intermediate";
  }
  
  // Check for basic keywords
  let basicCount = 0;
  for (const keyword of DSA_KEYWORDS.basic) {
    if (lowerText.includes(keyword)) {
      basicCount++;
    }
  }
  if (basicCount >= 2 || intermediateCount >= 1) {
    return "Basic";
  }
  
  return "None";
}

/**
 * Counts projects mentioned in resume.
 */
function countProjects(text: string): number {
  const lowerText = text.toLowerCase();
  let count = 0;
  
  // Count project section mentions
  const projectMatches = lowerText.match(/project[s]?\s*:?|\bbuilt\b|\bdeveloped\b|\bcreated\b/gi);
  if (projectMatches) {
    count = Math.min(projectMatches.length, 10);
  }
  
  // Look for bullet points in project sections
  const lines = text.split('\n');
  let inProjectSection = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('project')) {
      inProjectSection = true;
    }
    if (inProjectSection && (lowerLine.includes('experience') || lowerLine.includes('education'))) {
      inProjectSection = false;
    }
    if (inProjectSection && (line.trim().startsWith('-') || line.trim().startsWith('•'))) {
      count++;
    }
  }
  
  return Math.max(1, Math.min(count, 15));
}

/**
 * Checks if resume mentions internship experience.
 */
function hasInternship(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INTERNSHIP_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Extracts certifications mentioned as an array.
 */
function extractCertifications(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  // Common certification patterns
  const certPatterns = [
    /aws\s+(certified|associate|professional)/gi,
    /google\s+(cloud|certified)/gi,
    /microsoft\s+(certified|azure)/gi,
    /meta\s+certified/gi,
    /oracle\s+certified/gi,
    /coursera\s+certificate/gi,
    /udemy\s+certificate/gi,
  ];
  
  for (const pattern of certPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (!found.some(f => f.toLowerCase() === match.toLowerCase())) {
          found.push(match);
        }
      }
    }
  }
  
  // Also check generic keywords and extract nearby context
  for (const keyword of CERTIFICATION_KEYWORDS) {
    if (lowerText.includes(keyword) && found.length < 10) {
      if (!found.some(f => f.toLowerCase().includes(keyword))) {
        // Add a generic certification if we found the keyword
        if (keyword === "coursera" && !found.includes("Coursera Certificate")) {
          found.push("Coursera Certificate");
        } else if (keyword === "udemy" && !found.includes("Udemy Certificate")) {
          found.push("Udemy Certificate");
        }
      }
    }
  }
  
  return found.slice(0, 10);
}

/**
 * Counts hackathon participations.
 */
function countHackathons(text: string): number {
  const lowerText = text.toLowerCase();
  let count = 0;
  
  for (const keyword of HACKATHON_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      count++;
    }
  }
  
  // Also look for specific hackathon names or "participated in X hackathons"
  const hackathonMatch = lowerText.match(/(\d+)\s*hackathon/);
  if (hackathonMatch) {
    count = Math.max(count, parseInt(hackathonMatch[1], 10));
  }
  
  return Math.min(count, 10);
}

/**
 * Checks for open source contributions.
 */
function hasOpenSourceContributions(text: string): boolean {
  const lowerText = text.toLowerCase();
  return OPEN_SOURCE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Extracts CGPA from resume.
 */
function extractCGPA(text: string): number | null {
  const lowerText = text.toLowerCase();
  
  // Match patterns like "CGPA: 8.5", "GPA: 3.8/4.0", "CGPA 8.5/10"
  const cgpaPatterns = [
    /cgpa\s*:?\s*([\d.]+)\s*(?:\/\s*10)?/i,
    /gpa\s*:?\s*([\d.]+)\s*(?:\/\s*(?:4|10))?/i,
    /cumulative\s*(?:gpa|cgpa)\s*:?\s*([\d.]+)/i
  ];
  
  for (const pattern of cgpaPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      // If it's on 4.0 scale, convert to 10
      if (value <= 4.0) {
        return Math.round(value * 2.5 * 10) / 10; // Convert to 10 scale
      }
      return Math.min(value, 10);
    }
  }
  
  return null;
}

/**
 * Extracts percentage scores.
 */
function extractPercentage(text: string, type: '10th' | '12th'): number | null {
  const patterns = type === '10th' 
    ? [/10th\s*:?\s*([\d.]+)\s*%?/i, /class\s*10\s*:?\s*([\d.]+)/i, /x\s*:?\s*([\d.]+)\s*%/i]
    : [/12th\s*:?\s*([\d.]+)\s*%?/i, /class\s*12\s*:?\s*([\d.]+)/i, /xii\s*:?\s*([\d.]+)\s*%/i];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      return Math.min(value, 100);
    }
  }
  
  return null;
}

/**
 * Determines degree branch from resume.
 */
function determineBranch(text: string): DegreeBranch {
  const lowerText = text.toLowerCase();
  
  for (const [branch, keywords] of Object.entries(BRANCH_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return branch as DegreeBranch;
      }
    }
  }
  
  return "Other";
}

/**
 * Determines college tier (informational only, not stored in profile).
 */
function determineCollegeTier(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const college of TIER1_COLLEGES) {
    if (lowerText.includes(college)) {
      return "Tier 1";
    }
  }
  
  for (const college of TIER2_COLLEGES) {
    if (lowerText.includes(college)) {
      return "Tier 2";
    }
  }
  
  return "Tier 3";
}

/**
 * Calculates resume quality score based on content.
 */
function calculateResumeScore(text: string): number {
  let score = 50; // Base score
  
  // Check for essential sections
  if (text.toLowerCase().includes('education')) score += 5;
  if (text.toLowerCase().includes('experience')) score += 5;
  if (text.toLowerCase().includes('project')) score += 5;
  if (text.toLowerCase().includes('skill')) score += 5;
  
  // Check length (ideal: 500-2000 words)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 1000) score += 10;
  else if (wordCount > 1000) score += 5;
  
  // Check for contact info
  if (text.match(/[\w.-]+@[\w.-]+\.\w+/)) score += 5; // Email
  if (text.match(/github|linkedin/i)) score += 5; // Professional links
  
  // Check for quantifiable achievements
  const numbers = text.match(/\d+%|\d+\s*users?|\d+\s*team/gi);
  if (numbers && numbers.length >= 3) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Main resume parsing function.
 */
export async function parseResume(file: File): Promise<ResumeParseResult> {
  try {
    const text = await extractTextFromFile(file);
    
    if (!text || text.trim().length < 50) {
      return {
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: ["Unable to extract text from file"],
        warnings: ["Please ensure the file contains readable text"],
      };
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Extract all data
    const cgpa = extractCGPA(text);
    const tenthPercentage = extractPercentage(text, '10th');
    const twelfthPercentage = extractPercentage(text, '12th');
    
    if (!cgpa) missingFields.push("CGPA");
    if (!tenthPercentage) missingFields.push("10th Percentage");
    if (!twelfthPercentage) missingFields.push("12th Percentage");

    const programmingLanguages = extractProgrammingLanguages(text);
    const dsaLevel = determineDSALevel(text);
    const projectsCount = countProjects(text);
    const internship = hasInternship(text);
    const certifications = extractCertifications(text);
    const hackathonsCount = countHackathons(text);
    const openSource = hasOpenSourceContributions(text);
    const resumeScore = calculateResumeScore(text);
    const degreeBranch = determineBranch(text);
    // College tier is informational - used for warnings
    const collegeTier = determineCollegeTier(text);

    if (programmingLanguages.length === 0) {
      warnings.push("No programming languages detected");
    }
    
    if (collegeTier === "Tier 3") {
      warnings.push(`College tier detected: ${collegeTier}`);
    }

    const extractedData: Partial<CandidateProfile> = {
      academic: {
        cgpa: cgpa || 0,
        backlogs: 0, // Cannot determine from resume
        tenthPercentage: tenthPercentage || 0,
        twelfthPercentage: twelfthPercentage || 0,
        degreeBranch,
      },
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

    // Calculate confidence based on how much data was extracted
    const totalFields = 12;
    const filledFields = [
      cgpa, tenthPercentage, twelfthPercentage,
      programmingLanguages.length > 0, dsaLevel !== "None",
      projectsCount > 0, internship, certifications.length > 0,
      hackathonsCount > 0, openSource
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
    return {
      success: false,
      extractedData: {},
      confidence: 0,
      missingFields: [],
      warnings: [error instanceof Error ? error.message : "Failed to parse resume"],
    };
  }
}
