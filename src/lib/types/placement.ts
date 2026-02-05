/**
 * Type definitions for ML-Powered Student Placement Probability Prediction System.
 * Uses real machine learning models for predictions.
 */

/**
 * Available roles for placement prediction.
 */
export type PlacementRole = "Software Developer";

/**
 * DSA proficiency levels.
 */
export type DSALevel = "None" | "Basic" | "Intermediate" | "Advanced";

/**
 * Degree branch classification.
 */
export type DegreeBranch =
  | "Computer Science"
  | "Information Technology"
  | "Electronics"
  | "Electrical"
  | "Mechanical"
  | "Civil"
  | "Other";

/**
 * Risk category for placement.
 */
export type RiskCategory = "Low" | "Medium" | "High";

/**
 * Academic information of a candidate.
 */
export interface AcademicInfo {
  cgpa: number; // 0-10 scale
  backlogs: number;
  tenthPercentage: number; // 0-100
  twelfthPercentage: number; // 0-100
  degreeBranch: DegreeBranch | string;
}

/**
 * Technical skills of a candidate.
 */
export interface TechnicalSkills {
  programmingLanguages: string[];
  dsaLevel: DSALevel;
  projectsCount: number;
  hasInternship: boolean;
  certifications: string[];
}

/**
 * Experience and exposure of a candidate.
 */
export interface ExperienceInfo {
  hackathonsCount: number;
  hasOpenSourceContributions: boolean;
  resumeScore: number; // 0-100
}

/**
 * Soft skills assessment.
 */
export interface SoftSkills {
  aptitudeScore: number; // 0-100
  communicationScore: number; // 1-10
  mockInterviewScore: number; // 1-10
  englishFluency: number; // 1-10
}

/**
 * Complete candidate profile for placement prediction.
 */
export interface CandidateProfile {
  academic: AcademicInfo;
  technical: TechnicalSkills;
  experience: ExperienceInfo;
  softSkills: SoftSkills;
}

/**
 * Weakness identified in candidate profile.
 */
export interface WeaknessArea {
  area: string;
  currentValue: string;
  targetValue: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  suggestion: string;
}

/**
 * Strength identified in candidate profile.
 */
export interface StrengthArea {
  area: string;
  value: string;
  impact: "High" | "Medium" | "Low";
}

/**
 * Feature contribution to the ML prediction.
 */
export interface FeatureContribution {
  feature: string;
  value: number;
  contribution: number;
  importance: number; // ML-derived feature importance (0-100)
  impact: "positive" | "negative" | "neutral";
}

/**
 * Individual ML model insight.
 */
export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

/**
 * Insights from individual ML models.
 */
export interface ModelInsights {
  logisticRegressionProb: number;
  randomForestProb: number;
  knnPrediction: number;
  featureImportance: FeatureImportanceItem[];
}

/**
 * Complete placement prediction result from ML ensemble.
 */
export interface PlacementPrediction {
  probability: number; // 0-100
  riskCategory: RiskCategory;
  confidence: number; // 0-100 (based on model agreement)
  strengths: StrengthArea[];
  weaknesses: WeaknessArea[];
  featureContributions: FeatureContribution[];
  improvementSuggestions: string[];
  modelInsights: ModelInsights;
}

/**
 * Ideal criteria for a specific role.
 */
export interface RoleCriteria {
  role: PlacementRole;
  academic: {
    minCgpa: number;
    maxBacklogs: number;
    minTenthPercentage: number;
    minTwelfthPercentage: number;
    preferredBranches: string[];
  };
  technical: {
    minProgrammingLanguages: number;
    minDsaLevel: DSALevel;
    minProjects: number;
    internshipRequired: boolean;
    minCertifications: number;
  };
  experience: {
    minHackathons: number;
    openSourcePreferred: boolean;
    minResumeScore: number;
  };
  softSkills: {
    minAptitudeScore: number;
    minCommunicationScore: number;
    minMockInterviewScore: number;
    minEnglishFluency: number;
  };
}

/**
 * Resume parsing result.
 */
export interface ResumeParseResult {
  success: boolean;
  extractedData: Partial<CandidateProfile>;
  confidence: number;
  missingFields: string[];
  warnings: string[];
}

/**
 * Chart data for visualization.
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

/**
 * Radar chart data for skill visualization.
 */
export interface RadarDataPoint {
  skill: string;
  current: number;
  ideal: number;
}

/**
 * Cluster analysis result.
 */
export interface ClusterAnalysis {
  cluster: number;
  description: string;
  recommendation: string;
}

/**
 * PCA analysis insights.
 */
export interface PCAInsights {
  principalComponents: number[];
  varianceExplained: number[];
  interpretation: string;
}
