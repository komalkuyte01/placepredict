/**
 * ML-Powered Placement Prediction Engine
 *
 * Trains an ensemble of Logistic Regression, Random Forest, and KNN models
 * on curated placement data, and uses their weighted predictions to assess
 * a candidate's placement probability for Software Developer roles.
 */

import { kmeans } from "ml-kmeans";
import KNN from "ml-knn";
import LogisticRegression from "ml-logistic-regression";
import { Matrix } from "ml-matrix";
import { PCA } from "ml-pca";
import { RandomForestClassifier } from "ml-random-forest";
import placementTrainingData from "@/lib/ml/placement-training-data.json";
import type {
  CandidateProfile,
  DSALevel,
  FeatureContribution,
  PlacementPrediction,
  RiskCategory,
  RoleCriteria,
  StrengthArea,
  WeaknessArea,
} from "@/lib/types/placement";

/** A single labeled record used for model training. */
export interface TrainingDataPoint {
  features: number[];
  label: number;
}

/**
 * Human-readable feature names corresponding to each index of the feature vector.
 */
const FEATURE_NAMES = [
  "CGPA",
  "Backlogs",
  "10th Percentage",
  "12th Percentage",
  "Branch Relevance",
  "Technical Skills",
  "DSA Level",
  "Projects Count",
  "Has Internship",
  "Certifications",
  "Hackathons",
  "Open Source",
  "Resume ATS Score",
  "Aptitude Score",
  "Communication",
  "Mock Interview",
  "English Fluency",
];

/** Maps DSA proficiency level to a numeric scale (0–3). */
function dsaToNumeric(dsa: DSALevel): number {
  const map: Record<DSALevel, number> = {
    None: 0,
    Basic: 1,
    Intermediate: 2,
    Advanced: 3,
  };
  return map[dsa];
}

/** Extracts a 17-dimensional numeric feature vector from a candidate profile. */
export function extractFeatures(profile: CandidateProfile): number[] {
  return [
    profile.academic.cgpa ?? 0,
    profile.academic.backlogs ?? 0,
    profile.academic.tenthPercentage ?? 0,
    profile.academic.twelfthPercentage ?? 0,
    ["Computer Science", "Information Technology", "Electronics"].includes(
      profile.academic.degreeBranch,
    )
      ? 1
      : 0,
    profile.technical.technicalSkills.length,
    dsaToNumeric(profile.technical.dsaLevel),
    profile.technical.projectsCount ?? 0,
    profile.technical.hasInternship ? 1 : 0,
    profile.technical.certifications.length,
    profile.experience.hackathonsCount ?? 0,
    profile.experience.hasOpenSourceContributions ? 1 : 0,
    profile.experience.resumeATSScore,
    profile.softSkills.aptitudeScore,
    profile.softSkills.communicationScore,
    profile.softSkills.mockInterviewScore,
    profile.softSkills.englishFluency,
  ];
}

/** Applies min-max normalization to a feature matrix. */
function normalizeFeatures(
  features: number[][],
  mins?: number[],
  maxs?: number[],
): {
  normalized: number[][];
  mins: number[];
  maxs: number[];
} {
  const numFeatures = features[0]?.length ?? 0;
  const calculatedMins = mins ?? Array(numFeatures).fill(Infinity);
  const calculatedMaxs = maxs ?? Array(numFeatures).fill(-Infinity);

  if (!mins || !maxs) {
    for (const row of features) {
      for (let j = 0; j < numFeatures; j++) {
        calculatedMins[j] = Math.min(calculatedMins[j], row[j] ?? 0);
        calculatedMaxs[j] = Math.max(calculatedMaxs[j], row[j] ?? 0);
      }
    }
  }

  const normalized = features.map((row) =>
    row.map((val, j) => {
      const min = calculatedMins[j] ?? 0;
      const max = calculatedMaxs[j] ?? 1;
      return max === min ? 0.5 : (val - min) / (max - min);
    }),
  );

  return { normalized, mins: calculatedMins, maxs: calculatedMaxs };
}

/**
 * Loads the curated training dataset (3 000 records across 5 student archetypes)
 * from the bundled JSON file.
 */
export function generateTrainingData(): TrainingDataPoint[] {
  return (placementTrainingData as { features: number[]; label: number }[]).map(
    (d) => ({
      features: d.features,
      label: d.label,
    }),
  );
}

/** Container holding all trained model instances and normalization metadata. */
interface TrainedModels {
  logisticRegression: unknown;
  randomForest: unknown;
  knn: unknown;
  pca: PCA;
  featureImportance: number[];
  featureNames: string[];
  normalization: { mins: number[]; maxs: number[] };
  clusters?: { centroids: number[][]; assignments: number[] };
}

/** Trains Logistic Regression, Random Forest, KNN, PCA, and K-Means on the given data. */
export function trainModels(trainingData: TrainingDataPoint[]): TrainedModels {
  const features = trainingData.map((d) => d.features);
  const labels = trainingData.map((d) => d.label);

  const { normalized, mins, maxs } = normalizeFeatures(features);

  // Train Logistic Regression
  const lrFeatures = new Matrix(normalized);
  const logisticRegression = new LogisticRegression({
    numSteps: 1000,
    learningRate: 0.1,
  });
  logisticRegression.train(lrFeatures, Matrix.columnVector(labels));

  // Train Random Forest
  const randomForest = new RandomForestClassifier({
    nEstimators: 50,
    maxFeatures: 0.8,
    replacement: true,
    seed: 42,
  });
  randomForest.train(normalized, labels);

  // Train KNN
  const knn = new KNN(normalized, labels, { k: 5 });

  // PCA for analysis
  const pca = new PCA(normalized);

  // Calculate feature importance
  const featureImportance = calculateFeatureImportance(
    randomForest,
    normalized,
    labels,
  );

  // K-Means clustering
  const clusterResult = kmeans(normalized, 4, { initialization: "kmeans++" });

  return {
    logisticRegression,
    randomForest,
    knn,
    pca,
    featureImportance,
    featureNames: FEATURE_NAMES,
    normalization: { mins, maxs },
    clusters: {
      centroids: clusterResult.centroids,
      assignments: clusterResult.clusters,
    },
  };
}

/** Computes permutation-based feature importance against the Random Forest model. */
function calculateFeatureImportance(
  model: unknown,
  features: number[][],
  labels: number[],
): number[] {
  const rf = model as { predict: (x: number[][]) => number[] };
  const baseAccuracy = calculateAccuracy(rf, features, labels);
  const importances: number[] = [];
  const numFeatures = features[0]?.length ?? 0;

  for (let i = 0; i < numFeatures; i++) {
    const permuted = features.map((row) => [...row]);
    const originalValues = permuted.map((row) => row[i] ?? 0);

    for (let j = originalValues.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [originalValues[j], originalValues[k]] = [
        originalValues[k]!,
        originalValues[j]!,
      ];
    }

    permuted.forEach((row, idx) => {
      row[i] = originalValues[idx] ?? 0;
    });

    const permutedAccuracy = calculateAccuracy(rf, permuted, labels);
    importances.push(Math.max(0, baseAccuracy - permutedAccuracy));
  }

  const total = importances.reduce((a, b) => a + b, 0);
  return total > 0 ? importances.map((imp) => imp / total) : importances;
}

/** Returns the classification accuracy of a model on the given dataset. */
function calculateAccuracy(
  model: { predict: (x: number[][]) => number[] },
  features: number[][],
  labels: number[],
): number {
  const predictions = model.predict(features);
  let correct = 0;
  for (let i = 0; i < labels.length; i++) {
    if (predictions[i] === labels[i]) correct++;
  }
  return correct / labels.length;
}

/** Cached singleton — models are trained once and reused for all predictions. */
let trainedModels: TrainedModels | null = null;

/** Returns the cached model ensemble, training on first access. */
export function getTrainedModels(): TrainedModels {
  if (!trainedModels) {
    const trainingData = generateTrainingData();
    trainedModels = trainModels(trainingData);
  }
  return trainedModels;
}

/** Retrains models from scratch, optionally with custom data. */
export function retrainModels(customData?: TrainingDataPoint[]): TrainedModels {
  const trainingData = customData ?? generateTrainingData();
  trainedModels = trainModels(trainingData);
  return trainedModels;
}

/** Ideal placement criteria for the Software Developer role. */
export const SOFTWARE_DEVELOPER_CRITERIA: RoleCriteria = {
  role: "Software Developer",
  academic: {
    minCgpa: 7.0,
    maxBacklogs: 0,
    minTenthPercentage: 60,
    minTwelfthPercentage: 60,
    preferredBranches: [
      "Computer Science",
      "Information Technology",
      "Electronics",
    ],
  },
  technical: {
    minProgrammingLanguages: 2,
    minDsaLevel: "Intermediate",
    minProjects: 3,
    internshipRequired: true,
    minCertifications: 1,
  },
  experience: {
    minHackathons: 1,
    openSourcePreferred: true,
    minResumeATSScore: 70,
  },
  softSkills: {
    minAptitudeScore: 60,
    minCommunicationScore: 6,
    minMockInterviewScore: 6,
    minEnglishFluency: 6,
  },
};

/**
 * Feature weights: downweight academics, upweight technical/experience.
 * Indices: 0=CGPA, 1=Backlogs, 2=10th%, 3=12th%, 4=Branch,
 *          5=Skills, 6=DSA, 7=Projects, 8=Internship, 9=Certs,
 *         10=Hackathons, 11=OpenSource, 12=ATS, 13=Aptitude,
 *         14=Communication, 15=MockInterview, 16=English
 */
const FEATURE_WEIGHTS = [
  0.3,  // CGPA              — low priority
  0.5,  // Backlogs          — moderate (penalty)
  0.1,  // 10th Percentage   — very low priority
  0.1,  // 12th Percentage   — very low priority
  0.4,  // Branch Relevance  — low-moderate
  2.0,  // Technical Skills  — HIGH priority
  1.6,  // DSA Level         — HIGH priority
  2.0,  // Projects Count    — HIGH priority
  2.0,  // Has Internship    — HIGH priority
  1.2,  // Certifications    — medium priority
  1.2,  // Hackathons        — medium priority
  1.5,  // Open Source       — HIGH priority
  0.8,  // Resume ATS Score  — moderate
  0.6,  // Aptitude Score    — moderate
  1.0,  // Communication     — medium priority
  0.8,  // Mock Interview    — moderate
  0.6,  // English Fluency   — moderate
];

/**
 * Normalizes a single feature vector and applies feature weighting.
 */
function normalizeSingleFeature(
  features: number[],
  mins: number[],
  maxs: number[],
): number[] {
  return features.map((val, j) => {
    const min = mins[j] ?? 0;
    const max = maxs[j] ?? 1;
    const normalized = max === min ? 0.5 : (val - min) / (max - min);
    return normalized * (FEATURE_WEIGHTS[j] ?? 1.0);
  });
}

/**
 * Main prediction function using ML ensemble.
 * Uses a weighted ensemble: Random Forest (50%), KNN (25%), Logistic Regression (25%).
 */
export function predictPlacement(
  profile: CandidateProfile,
  _criteria: RoleCriteria = SOFTWARE_DEVELOPER_CRITERIA,
): PlacementPrediction {
  // Get trained ML models
  const models = getTrainedModels();

  // Extract and normalize candidate features
  const rawFeatures = extractFeatures(profile);
  const normalizedFeatures = normalizeSingleFeature(
    rawFeatures,
    models.normalization.mins,
    models.normalization.maxs,
  );

  // Run predictions through each model
  const rfPrediction =
    (models.randomForest as { predict: (x: number[][]) => number[] }).predict([
      normalizedFeatures,
    ])[0] ?? 0;
  const knnPrediction =
    (models.knn as { predict: (x: number[][]) => number[] }).predict([
      normalizedFeatures,
    ])[0] ?? 0;
  const lrPrediction =
    (models.logisticRegression as { predict: (x: Matrix) => number[] }).predict(
      new Matrix([normalizedFeatures]),
    )[0] ?? 0;

  // Weighted ensemble: RF 50%, KNN 25%, LR 25%
  // ensembleScore will be one of: 0, 0.25, 0.5, 0.75, or 1.0
  const ensembleScore =
    rfPrediction * 0.5 + knnPrediction * 0.25 + lrPrediction * 0.25;

  // The ensemble determines the probability band (primary signal)
  // The heuristic adds granularity within that band (secondary signal)
  // This ensures ML models drive the prediction, not the heuristic
  const baseFromEnsemble = ensembleScore * 70; // 0, 17.5, 35, 52.5, or 70
  const heuristicProbability = calculateRealProbability(profile);
  const heuristicBonus = (heuristicProbability / 100) * 30; // 0-30 granularity
  let probability = baseFromEnsemble + heuristicBonus;

  // ── Eligibility penalties ──
  // Most companies enforce hard cutoffs on these criteria.
  // Failing them drastically reduces placement chances.
  const cgpa = profile.academic.cgpa ?? 0;
  const twelfthPct = profile.academic.twelfthPercentage ?? 0;
  const skillCount = profile.technical.technicalSkills.length;
  const projectCount = profile.technical.projectsCount ?? 0;

  if (cgpa > 0 && cgpa < 7.5) {
    probability *= 0.3; // Most companies require 7.5+ CGPA
  }
  if (twelfthPct > 0 && twelfthPct < 60) {
    probability *= 0.2; // 60% in 12th is a common minimum
  }
  if (skillCount < 5) {
    probability *= 0.3; // Fewer than 5 skills is a major red flag
  }
  if (projectCount < 2) {
    probability *= 0.3; // Companies expect at least 2-3 projects
  }

  // Calculate contributions
  const contributions = calculateSimpleContributions(profile);

  // Identify strengths and weaknesses with correct impact rules
  const strengths = identifyStrengthsWithRules(profile);
  const weaknesses = identifyWeaknessesWithRules(profile, _criteria);

  // Generate suggestions
  const suggestions = generateSmartSuggestions(weaknesses, profile);

  return {
    probability: Math.round(Math.max(0, Math.min(100, probability)) * 10) / 10,
    confidence: calculateSimpleConfidence(probability),
    riskCategory: getRiskCategory(probability),
    strengths,
    weaknesses,
    improvementSuggestions: suggestions,
    featureContributions: contributions,
    modelInsights: {
      logisticRegressionProb: lrPrediction * 100,
      randomForestProb: rfPrediction * 100,
      knnPrediction,
      featureImportance: models.featureImportance.map((imp, i) => ({
        feature: FEATURE_NAMES[i] ?? `Feature ${i}`,
        importance: imp,
      })),
    },
  };
}

/**
 * Heuristic probability scoring.
 * Point allocation: Academic 10, Technical 45, Experience 25, Soft Skills 20 = 100.
 */
function calculateRealProbability(profile: CandidateProfile): number {
  let score = 0;
  const maxScore = 100;

  // ── Academic (10 points max) — low priority ──
  const cgpa = profile.academic.cgpa ?? 0;
  const backlogs = profile.academic.backlogs ?? 0;

  // CGPA: 0-5 points
  if (cgpa >= 9) score += 5;
  else if (cgpa >= 8) score += 4;
  else if (cgpa >= 7) score += 3;
  else if (cgpa >= 6) score += 1;
  else score += cgpa * 0.2;

  // 10th/12th: 0-1 point each (minimal impact)
  if ((profile.academic.tenthPercentage ?? 0) >= 70) score += 1;
  if ((profile.academic.twelfthPercentage ?? 0) >= 70) score += 1;

  // Branch relevance: 0-1 point
  if (
    ["Computer Science", "Information Technology", "Electronics"].includes(
      profile.academic.degreeBranch,
    )
  ) {
    score += 1;
  }

  // Backlogs penalty: -3 per backlog (max -9)
  score -= Math.min(backlogs * 3, 9);

  // ── Technical (45 points max) — HIGH priority ──
  const skills = profile.technical.technicalSkills.length;
  const dsa = profile.technical.dsaLevel;
  const projects = profile.technical.projectsCount ?? 0;
  const hasInternship = profile.technical.hasInternship;
  const certs = profile.technical.certifications.length;

  // Technical skills: 0-10 points
  score += Math.min(skills * 2, 10);

  // DSA Level: 0-12 points (most critical technical factor)
  if (dsa === "Advanced") score += 12;
  else if (dsa === "Intermediate") score += 8;
  else if (dsa === "Basic") score += 3;

  // Projects: 0-10 points
  score += Math.min(projects * 2.5, 10);

  // Internship: 0-10 points
  if (hasInternship) score += 10;

  // Certifications: 0-3 points
  score += Math.min(certs, 3);

  // ── Experience (25 points max) — high priority ──
  const hackathons = profile.experience.hackathonsCount ?? 0;
  const hasOpenSource = profile.experience.hasOpenSourceContributions;
  const atsScore = profile.experience.resumeATSScore;

  // Hackathons: 0-6 points
  score += Math.min(hackathons * 2, 6);

  // Open source: 0-8 points
  if (hasOpenSource) score += 8;

  // ATS Score: 0-5 points
  score += (atsScore / 100) * 5;

  // ── Soft Skills (20 points max) — medium priority ──
  const aptitude = profile.softSkills.aptitudeScore;
  const communication = profile.softSkills.communicationScore;
  const mockInterview = profile.softSkills.mockInterviewScore;
  const english = profile.softSkills.englishFluency;

  // Aptitude: 0-5 points
  score += (aptitude / 100) * 5;

  // Communication: 0-6 points
  score += (communication / 10) * 6;

  // Mock Interview: 0-5 points
  score += (mockInterview / 10) * 5;

  // English: 0-4 points
  score += (english / 10) * 4;

  return Math.max(0, Math.min(maxScore, score));
}

/**
 * Calculate simple confidence based on probability.
 */
function calculateSimpleConfidence(probability: number): number {
  // Higher confidence when probability is more extreme
  const extremity = Math.abs(probability - 50) * 2;
  return Math.round(50 + extremity * 0.5);
}

/**
 * Calculate simple contributions for display.
 */
function calculateSimpleContributions(
  profile: CandidateProfile,
): FeatureContribution[] {
  const contributions: FeatureContribution[] = [];

  const cgpa = profile.academic.cgpa ?? 0;
  const backlogs = profile.academic.backlogs ?? 0;
  const tenth = profile.academic.tenthPercentage ?? 0;
  const twelfth = profile.academic.twelfthPercentage ?? 0;
  const skills = profile.technical.technicalSkills.length;
  const dsa = dsaToNumeric(profile.technical.dsaLevel);
  const projects = profile.technical.projectsCount ?? 0;
  const certs = profile.technical.certifications.length;
  const aptitude = profile.softSkills.aptitudeScore;

  contributions.push(
    {
      feature: "CGPA",
      value: cgpa,
      contribution: cgpa * 10,
      importance: cgpa >= 8 ? 15 : 10,
      impact: cgpa >= 7 ? "positive" : "negative",
    },
    {
      feature: "Technical Skills",
      value: skills,
      contribution: skills * 15,
      importance: 20,
      impact: skills >= 3 ? "positive" : "negative",
    },
    {
      feature: "DSA Level",
      value: dsa,
      contribution: dsa * 25,
      importance: 20,
      impact: dsa >= 2 ? "positive" : "negative",
    },
    {
      feature: "Projects Count",
      value: projects,
      contribution: projects * 10,
      importance: 12,
      impact: projects >= 2 ? "positive" : "neutral",
    },
    {
      feature: "Certifications",
      value: certs,
      contribution: certs * 12,
      importance: 10,
      impact: certs >= 1 ? "positive" : "neutral",
    },
    {
      feature: "Aptitude Score",
      value: aptitude,
      contribution: aptitude,
      importance: 12,
      impact: aptitude >= 70 ? "positive" : "negative",
    },
    {
      feature: "10th Percentage",
      value: tenth,
      contribution: tenth,
      importance: 5,
      impact: tenth >= 70 ? "positive" : "neutral",
    },
    {
      feature: "12th Percentage",
      value: twelfth,
      contribution: twelfth,
      importance: 5,
      impact: twelfth >= 70 ? "positive" : "neutral",
    },
    {
      feature: "Backlogs",
      value: backlogs,
      contribution: -backlogs * 20,
      importance: 15,
      impact: backlogs === 0 ? "positive" : "negative",
    },
  );

  return contributions.sort((a, b) => b.importance - a.importance);
}

/**
 * Identify strengths with user-specified impact rules.
 */
function identifyStrengthsWithRules(profile: CandidateProfile): StrengthArea[] {
  const strengths: StrengthArea[] = [];

  const cgpa = profile.academic.cgpa ?? 0;
  const tenth = profile.academic.tenthPercentage ?? 0;
  const twelfth = profile.academic.twelfthPercentage ?? 0;
  const backlogs = profile.academic.backlogs ?? 0;
  const skills = profile.technical.technicalSkills.length;
  const dsa = profile.technical.dsaLevel;
  const certs = profile.technical.certifications.length;
  const aptitude = profile.softSkills.aptitudeScore;
  const hasInternship = profile.technical.hasInternship;
  const projects = profile.technical.projectsCount ?? 0;

  // Technical skills: always high impact
  if (skills >= 3) {
    strengths.push({
      area: "Technical Skills",
      value: `${skills} skills`,
      impact: "High",
    });
  }

  // Certifications: medium impact
  if (certs >= 1) {
    strengths.push({
      area: "Certifications",
      value: `${certs} certification${certs > 1 ? "s" : ""}`,
      impact: "Medium",
    });
  }

  // Aptitude: same as percentage (<80 low, 80-90 medium, >90 high)
  if (aptitude >= 60) {
    let impact: "High" | "Medium" | "Low" = "Low";
    if (aptitude >= 90) impact = "High";
    else if (aptitude >= 80) impact = "Medium";
    strengths.push({
      area: "Aptitude Score",
      value: `${Math.round(aptitude)}%`,
      impact,
    });
  }

  // Internship
  if (hasInternship) {
    strengths.push({
      area: "Internship Experience",
      value: "Yes",
      impact: "High",
    });
  }

  // Projects
  if (projects >= 3) {
    strengths.push({
      area: "Projects",
      value: `${projects} projects`,
      impact: "Medium",
    });
  }

  // Sort by impact priority
  const impactOrder = { High: 0, Medium: 1, Low: 2 };
  return strengths.sort(
    (a, b) => impactOrder[a.impact] - impactOrder[b.impact],
  );
}

/**
 * Identify weaknesses - exclude fields that can't be improved (CGPA, percentages)
 * and don't show backlogs if 0.
 */
function identifyWeaknessesWithRules(
  profile: CandidateProfile,
  criteria: RoleCriteria,
): WeaknessArea[] {
  const weaknesses: WeaknessArea[] = [];

  const backlogs = profile.academic.backlogs ?? 0;
  const skills = profile.technical.technicalSkills.length;
  const dsa = profile.technical.dsaLevel;
  const projects = profile.technical.projectsCount ?? 0;
  const hasInternship = profile.technical.hasInternship;
  const certs = profile.technical.certifications.length;
  const aptitude = profile.softSkills.aptitudeScore;
  const communication = profile.softSkills.communicationScore;
  const mockInterview = profile.softSkills.mockInterviewScore;
  const hackathons = profile.experience.hackathonsCount ?? 0;
  const hasOpenSource = profile.experience.hasOpenSourceContributions;
  const atsScore = profile.experience.resumeATSScore;

  // Backlogs - only show if > 0
  if (backlogs > 0) {
    weaknesses.push({
      area: "Active Backlogs",
      currentValue: `${backlogs} backlog${backlogs > 1 ? "s" : ""}`,
      targetValue: "0",
      priority: backlogs >= 3 ? "Critical" : backlogs >= 1 ? "High" : "Medium",
      suggestion:
        "Clear your backlogs - most companies have strict policies against backlogs",
    });
  }

  // DSA Level
  if (dsa === "None" || dsa === "Basic") {
    weaknesses.push({
      area: "DSA Skills",
      currentValue: dsa,
      targetValue: "Intermediate+",
      priority: dsa === "None" ? "Critical" : "High",
      suggestion:
        "Practice DSA daily on LeetCode/HackerRank - aim for 200+ problems",
    });
  }

  // Technical Skills
  if (skills < 3) {
    weaknesses.push({
      area: "Technical Skills",
      currentValue: `${skills} skill${skills !== 1 ? "s" : ""}`,
      targetValue: "Learn relevant skills",
      priority: skills === 0 ? "Critical" : "High",
      suggestion:
        "Learn in-demand technologies like React, Node.js, Python, or Java",
    });
  }

  // Internship
  if (!hasInternship) {
    weaknesses.push({
      area: "Internship",
      currentValue: "No",
      targetValue: "Have atleast 1 internship",
      priority: "High",
      suggestion:
        "Apply for internships - practical experience is highly valued by recruiters",
    });
  }

  // Projects
  if (projects < 2) {
    weaknesses.push({
      area: "Projects",
      currentValue: `${projects} project${projects !== 1 ? "s" : ""}`,
      targetValue: "3+ projects",
      priority: projects === 0 ? "High" : "Medium",
      suggestion:
        "Build full-stack projects with real-world applications and deploy them",
    });
  }

  // Certifications
  if (certs === 0) {
    weaknesses.push({
      area: "Certifications",
      currentValue: "None",
      targetValue: "2+ certifications",
      priority: "Medium",
      suggestion:
        "Get certified in cloud (AWS/Azure), or tech stacks you're learning",
    });
  }

  // Communication
  if (communication < 6) {
    weaknesses.push({
      area: "Communication",
      currentValue: `${communication}/10`,
      targetValue: "7+/10",
      priority: communication < 4 ? "High" : "Medium",
      suggestion: "Join speaking clubs, practice mock interviews regularly",
    });
  }

  // Mock Interview
  if (mockInterview < 6) {
    weaknesses.push({
      area: "Interview Skills",
      currentValue: `${mockInterview}/10`,
      targetValue: "7+/10",
      priority: mockInterview < 4 ? "High" : "Medium",
      suggestion:
        "Practice mock interviews on Pramp, InterviewBit, or with peers",
    });
  }

  // Aptitude - this CAN be improved through practice
  if (aptitude < 60) {
    weaknesses.push({
      area: "Aptitude",
      currentValue: `${Math.round(aptitude)}%`,
      targetValue: "70%+",
      priority: aptitude < 40 ? "High" : "Medium",
      suggestion:
        "Practice aptitude daily on IndiaBix, PrepInsta - focus on quant & reasoning",
    });
  }

  // ATS Score
  if (atsScore < 70) {
    weaknesses.push({
      area: "Resume ATS Score",
      currentValue: `${Math.round(atsScore)}%`,
      targetValue: "80%+",
      priority: atsScore < 50 ? "High" : "Medium",
      suggestion:
        "Use action verbs, quantify achievements, proper formatting for ATS",
    });
  }

  // Hackathons
  if (hackathons === 0) {
    weaknesses.push({
      area: "Hackathons",
      currentValue: "0 hackathons",
      targetValue: "Participate in 1+ hackathon",
      priority: "Medium",
      suggestion:
        "Participate in hackathons like MLH, DevPost - great for experience & networking",
    });
  }

  // Open Source
  if (!hasOpenSource) {
    weaknesses.push({
      area: "Open Source",
      currentValue: "No contributions",
      targetValue: "Contribute to open source",
      priority: "Medium",
      suggestion:
        "Start with beginner-friendly repos on GitHub - look for 'good first issue' labels",
    });
  }

  // Sort by priority
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return weaknesses.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
}

/**
 * Generate smart suggestions based on weaknesses and profile.
 */
function generateSmartSuggestions(
  weaknesses: WeaknessArea[],
  profile: CandidateProfile,
): string[] {
  const suggestions: string[] = [];

  const critical = weaknesses.filter((w) => w.priority === "Critical");
  const high = weaknesses.filter((w) => w.priority === "High");

  for (const weakness of critical) {
    suggestions.push(`🚨 CRITICAL: ${weakness.suggestion}`);
  }

  for (const weakness of high.slice(0, 2)) {
    suggestions.push(`⚠️ HIGH PRIORITY: ${weakness.suggestion}`);
  }

  // Add contextual suggestions
  const dsa = profile.technical.dsaLevel;
  const hasInternship = profile.technical.hasInternship;
  const skills = profile.technical.technicalSkills.length;

  if (dsa === "Advanced" && hasInternship && skills >= 3) {
    suggestions.push(
      "📊 You have a strong profile - focus on system design and competitive programming",
    );
  } else if (skills < 2) {
    suggestions.push(
      "💡 TIP: Master one programming language before learning multiple",
    );
  }

  return suggestions.slice(0, 5);
}

/** Maps a probability percentage to a risk category. */
function getRiskCategory(probability: number): RiskCategory {
  if (probability >= 70) return "Low";
  if (probability >= 40) return "Medium";
  return "High";
}

/** Returns a default empty candidate profile with sensible initial values. */
export function createEmptyProfile(): CandidateProfile {
  return {
    academic: {
      cgpa: 7.0,
      backlogs: 0,
      tenthPercentage: 75,
      twelfthPercentage: 75,
      degreeBranch: "Computer Science",
    },
    technical: {
      technicalSkills: [],
      dsaLevel: "Basic",
      projectsCount: 0,
      hasInternship: false,
      certifications: [],
    },
    experience: {
      hackathonsCount: 0,
      hasOpenSourceContributions: false,
      resumeATSScore: 50,
    },
    softSkills: {
      aptitudeScore: 50,
      communicationScore: 5,
      mockInterviewScore: 5,
      englishFluency: 5,
    },
  };
}

/** Assigns the candidate to a peer cluster and returns a description and recommendation. */
export function analyzeCandidateCluster(profile: CandidateProfile) {
  const models = getTrainedModels();
  const features = extractFeatures(profile);

  const normalized = features.map((val, i) => {
    const min = models.normalization.mins[i] ?? 0;
    const max = models.normalization.maxs[i] ?? 1;
    return max === min ? 0.5 : (val - min) / (max - min);
  });

  if (!models.clusters) {
    return {
      cluster: 0,
      description: "Analysis unavailable",
      recommendation: "",
    };
  }

  let nearestCluster = 0;
  let minDistance = Infinity;

  for (let c = 0; c < models.clusters.centroids.length; c++) {
    const centroid = models.clusters.centroids[c];
    if (!centroid) continue;

    let distance = 0;
    for (let i = 0; i < normalized.length; i++) {
      distance += ((normalized[i] ?? 0) - (centroid[i] ?? 0)) ** 2;
    }
    distance = Math.sqrt(distance);

    if (distance < minDistance) {
      minDistance = distance;
      nearestCluster = c;
    }
  }

  const descriptions = [
    "High Performers - Strong academics and technical skills",
    "Technical Specialists - Good coding but needs soft skills",
    "Well-Rounded - Balanced profile, strengthen weakest areas",
    "Needs Development - Focus on building core competencies",
  ];

  const recommendations = [
    "Target top-tier companies, focus on system design",
    "Practice communication and mock interviews",
    "Identify and strengthen your weakest area",
    "Build foundational skills first - DSA, one strong project",
  ];

  return {
    cluster: nearestCluster,
    description: descriptions[nearestCluster] ?? "Unknown",
    recommendation: recommendations[nearestCluster] ?? "",
  };
}

/** Projects the candidate's profile into the top 3 principal components for analysis. */
export function getPCAInsights(profile: CandidateProfile) {
  const models = getTrainedModels();
  const features = extractFeatures(profile);

  const normalized = features.map((val, i) => {
    const min = models.normalization.mins[i] ?? 0;
    const max = models.normalization.maxs[i] ?? 1;
    return max === min ? 0.5 : (val - min) / (max - min);
  });

  const transformed = models.pca.predict([normalized]);
  const variance = models.pca.getExplainedVariance();

  const topComponents = transformed.to2DArray()[0]?.slice(0, 3) ?? [0, 0, 0];
  const topVariance = variance.slice(0, 3);

  let interpretation = "";
  if (topComponents[0]! > 0.5) {
    interpretation = "Strong overall competency (high PC1)";
  } else if (topComponents[0]! < -0.5) {
    interpretation = "Focus on improving core metrics";
  } else {
    interpretation = "Average profile - targeted improvements can help";
  }

  return {
    principalComponents: topComponents.map((v) => Math.round(v * 100) / 100),
    varianceExplained: topVariance.map((v) => Math.round(v * 100)),
    interpretation,
  };
}
