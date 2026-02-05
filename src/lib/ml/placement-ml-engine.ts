/**
 * Real ML-Powered Placement Prediction Engine.
 * Uses machine learning models trained on data for predictions.
 */

import LogisticRegression from "ml-logistic-regression";
import { RandomForestClassifier } from "ml-random-forest";
import { Matrix } from "ml-matrix";
import KNN from "ml-knn";
import { PCA } from "ml-pca";
import { kmeans } from "ml-kmeans";
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

/**
 * Training data point for ML models.
 */
export interface TrainingDataPoint {
  features: number[];
  label: number;
  probability?: number;
}

/**
 * Feature names for interpretability.
 */
const FEATURE_NAMES = [
  "CGPA",
  "Backlogs",
  "10th Percentage",
  "12th Percentage",
  "Branch Relevance",
  "Programming Languages",
  "DSA Level",
  "Projects Count",
  "Has Internship",
  "Certifications",
  "Hackathons",
  "Open Source",
  "Resume Score",
  "Aptitude Score",
  "Communication",
  "Mock Interview",
  "English Fluency",
];

/**
 * Converts DSA level to numeric.
 */
function dsaToNumeric(dsa: DSALevel): number {
  const map: Record<DSALevel, number> = { None: 0, Basic: 1, Intermediate: 2, Advanced: 3 };
  return map[dsa];
}

/**
 * Extracts feature vector from candidate profile.
 */
export function extractFeatures(profile: CandidateProfile): number[] {
  return [
    profile.academic.cgpa,
    profile.academic.backlogs,
    profile.academic.tenthPercentage,
    profile.academic.twelfthPercentage,
    ["Computer Science", "Information Technology", "Electronics"].includes(profile.academic.degreeBranch) ? 1 : 0,
    profile.technical.programmingLanguages.length,
    dsaToNumeric(profile.technical.dsaLevel),
    profile.technical.projectsCount,
    profile.technical.hasInternship ? 1 : 0,
    profile.technical.certifications.length,
    profile.experience.hackathonsCount,
    profile.experience.hasOpenSourceContributions ? 1 : 0,
    profile.experience.resumeScore,
    profile.softSkills.aptitudeScore,
    profile.softSkills.communicationScore,
    profile.softSkills.mockInterviewScore,
    profile.softSkills.englishFluency,
  ];
}

/**
 * Normalizes features using min-max scaling.
 */
function normalizeFeatures(features: number[][], mins?: number[], maxs?: number[]): {
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
    })
  );

  return { normalized, mins: calculatedMins, maxs: calculatedMaxs };
}

/**
 * Generates synthetic training data based on realistic patterns.
 */
export function generateTrainingData(sampleSize: number = 500): TrainingDataPoint[] {
  const data: TrainingDataPoint[] = [];
  
  for (let i = 0; i < sampleSize; i++) {
    const cgpa = 4 + Math.random() * 6;
    const backlogs = Math.floor(Math.random() * Math.random() * 10);
    const tenth = 50 + Math.random() * 50;
    const twelfth = 50 + Math.random() * 50;
    const branchRelevant = Math.random() > 0.3 ? 1 : 0;
    const progLangs = Math.floor(1 + Math.random() * 5);
    const dsaLevel = Math.floor(Math.random() * 4);
    const projects = Math.floor(Math.random() * 8);
    const hasInternship = Math.random() > 0.4 ? 1 : 0;
    const certs = Math.floor(Math.random() * 5);
    const hackathons = Math.floor(Math.random() * Math.random() * 10);
    const openSource = Math.random() > 0.7 ? 1 : 0;
    const resumeScore = 30 + Math.random() * 70;
    const aptitude = 30 + Math.random() * 70;
    const communication = 3 + Math.random() * 7;
    const mockInterview = 3 + Math.random() * 7;
    const english = 3 + Math.random() * 7;

    const features = [
      cgpa, backlogs, tenth, twelfth, branchRelevant,
      progLangs, dsaLevel, projects, hasInternship, certs,
      hackathons, openSource, resumeScore, aptitude,
      communication, mockInterview, english,
    ];

    // Calculate realistic placement probability
    let score = 0;
    score += (cgpa - 4) / 6 * 20;
    score -= backlogs * 5;
    score += (tenth - 50) / 50 * 5;
    score += (twelfth - 50) / 50 * 5;
    score += branchRelevant * 10;
    score += progLangs * 3;
    score += dsaLevel * 8;
    score += projects * 3;
    score += hasInternship * 15;
    score += certs * 2;
    score += hackathons * 2;
    score += openSource * 5;
    score += (resumeScore - 30) / 70 * 10;
    score += (aptitude - 30) / 70 * 10;
    score += (communication - 3) / 7 * 5;
    score += (mockInterview - 3) / 7 * 5;
    score += (english - 3) / 7 * 3;

    score += (Math.random() - 0.5) * 15;

    const probability = Math.max(0, Math.min(100, score));
    const label = probability >= 50 ? 1 : 0;

    data.push({ features, label, probability });
  }

  return data;
}

/**
 * Trained model container.
 */
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

/**
 * Trains all ML models on provided data.
 */
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
  const featureImportance = calculateFeatureImportance(randomForest, normalized, labels);

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

/**
 * Calculates feature importance using permutation importance.
 */
function calculateFeatureImportance(
  model: unknown,
  features: number[][],
  labels: number[]
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
      [originalValues[j], originalValues[k]] = [originalValues[k]!, originalValues[j]!];
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

/**
 * Calculates model accuracy.
 */
function calculateAccuracy(
  model: { predict: (x: number[][]) => number[] },
  features: number[][],
  labels: number[]
): number {
  const predictions = model.predict(features);
  let correct = 0;
  for (let i = 0; i < labels.length; i++) {
    if (predictions[i] === labels[i]) correct++;
  }
  return correct / labels.length;
}

/**
 * Singleton model instance.
 */
let trainedModels: TrainedModels | null = null;

/**
 * Gets or initializes trained models.
 */
export function getTrainedModels(): TrainedModels {
  if (!trainedModels) {
    const trainingData = generateTrainingData(1000);
    trainedModels = trainModels(trainingData);
  }
  return trainedModels;
}

/**
 * Retrains models with new data.
 */
export function retrainModels(customData?: TrainingDataPoint[]): TrainedModels {
  const trainingData = customData ?? generateTrainingData(1000);
  trainedModels = trainModels(trainingData);
  return trainedModels;
}

/**
 * Role criteria for Software Developer.
 */
export const SOFTWARE_DEVELOPER_CRITERIA: RoleCriteria = {
  role: "Software Developer",
  academic: {
    minCgpa: 7.0,
    maxBacklogs: 0,
    minTenthPercentage: 60,
    minTwelfthPercentage: 60,
    preferredBranches: ["Computer Science", "Information Technology", "Electronics"],
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
    minResumeScore: 70,
  },
  softSkills: {
    minAptitudeScore: 60,
    minCommunicationScore: 6,
    minMockInterviewScore: 6,
    minEnglishFluency: 6,
  },
};

/**
 * Main prediction function using ML ensemble.
 */
export function predictPlacement(
  profile: CandidateProfile,
  _criteria: RoleCriteria = SOFTWARE_DEVELOPER_CRITERIA
): PlacementPrediction {
  const models = getTrainedModels();
  const features = extractFeatures(profile);
  
  // Normalize input
  const normalized = features.map((val, i) => {
    const min = models.normalization.mins[i] ?? 0;
    const max = models.normalization.maxs[i] ?? 1;
    return max === min ? 0.5 : (val - min) / (max - min);
  });

  // Get predictions from each model
  const lr = models.logisticRegression as { predict: (x: Matrix) => Matrix };
  const rf = models.randomForest as { predict: (x: number[][]) => number[]; predictionValues?: number[][] };
  const knn = models.knn as { predict: (x: number[][]) => number[] };

  const lrPrediction = lr.predict(new Matrix([normalized]));
  // Handle different return types from ml-logistic-regression
  let lrProb: number;
  if (typeof lrPrediction === 'number') {
    lrProb = lrPrediction;
  } else if (Array.isArray(lrPrediction)) {
    lrProb = lrPrediction[0] ?? 0.5;
  } else if (lrPrediction && typeof (lrPrediction as Matrix).to1DArray === 'function') {
    lrProb = (lrPrediction as Matrix).to1DArray()[0] ?? 0.5;
  } else if (lrPrediction && typeof (lrPrediction as Matrix).to2DArray === 'function') {
    const arr = (lrPrediction as Matrix).to2DArray();
    lrProb = arr[0]?.[0] ?? 0.5;
  } else {
    lrProb = 0.5;
  }

  const rfPrediction = rf.predict([normalized])[0] ?? 0;
  const rfProbs = rf.predictionValues ?? [[0.5, 0.5]];
  const rfProb = rfProbs[0]?.[1] ?? 0.5;

  const knnPrediction = knn.predict([normalized])[0] ?? 0;

  // Ensemble: weighted average
  const ensembleProbability = (lrProb * 0.3 + rfProb * 0.5 + knnPrediction * 0.2) * 100;
  const finalProbability = Math.max(0, Math.min(100, ensembleProbability));

  // Calculate contributions
  const contributions = calculateContributions(features, normalized, models);
  
  // Identify strengths and weaknesses
  const strengths = identifyStrengths(contributions);
  const weaknesses = identifyWeaknesses(contributions, _criteria);

  // Generate suggestions
  const suggestions = generateSuggestions(weaknesses, models);

  return {
    probability: Math.round(finalProbability * 10) / 10,
    confidence: calculateConfidence(lrProb, rfProb, knnPrediction),
    riskCategory: getRiskCategory(finalProbability),
    strengths,
    weaknesses,
    improvementSuggestions: suggestions,
    featureContributions: contributions,
    modelInsights: {
      logisticRegressionProb: Math.round(lrProb * 1000) / 10,
      randomForestProb: Math.round(rfProb * 1000) / 10,
      knnPrediction,
      featureImportance: models.featureImportance.map((imp, i) => ({
        feature: FEATURE_NAMES[i] ?? `Feature ${i}`,
        importance: Math.round(imp * 1000) / 10,
      })),
    },
  };
}

/**
 * Calculates prediction confidence.
 */
function calculateConfidence(lrProb: number, rfProb: number, knnPred: number): number {
  const predictions = [lrProb > 0.5 ? 1 : 0, rfProb > 0.5 ? 1 : 0, knnPred];
  const agreement = predictions.filter((p) => p === predictions[0]).length;
  const baseConfidence = agreement / predictions.length;
  const avgProb = (lrProb + rfProb + knnPred) / 3;
  const extremity = Math.abs(avgProb - 0.5) * 2;
  return Math.round((baseConfidence * 0.6 + extremity * 0.4) * 100);
}

/**
 * Calculates feature contributions.
 */
function calculateContributions(
  features: number[],
  normalized: number[],
  models: TrainedModels
): FeatureContribution[] {
  const contributions: FeatureContribution[] = [];
  const importance = models.featureImportance;

  for (let i = 0; i < FEATURE_NAMES.length; i++) {
    const featureValue = features[i] ?? 0;
    const normalizedValue = normalized[i] ?? 0;
    const featureImportance = importance[i] ?? 0;
    const contribution = normalizedValue * featureImportance * 100;
    
    contributions.push({
      feature: FEATURE_NAMES[i] ?? `Feature ${i}`,
      value: featureValue,
      contribution: Math.round(contribution * 10) / 10,
      importance: Math.round(featureImportance * 100),
      impact: normalizedValue >= 0.6 ? "positive" : normalizedValue <= 0.4 ? "negative" : "neutral",
    });
  }

  return contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

/**
 * Identifies strengths from contributions.
 */
function identifyStrengths(contributions: FeatureContribution[]): StrengthArea[] {
  return contributions
    .filter((c) => c.impact === "positive")
    .slice(0, 5)
    .map((contrib) => ({
      area: contrib.feature,
      value: formatFeatureValue(contrib.feature, contrib.value),
      impact: contrib.importance > 10 ? "High" as const : contrib.importance > 5 ? "Medium" as const : "Low" as const,
    }));
}

/**
 * Identifies weaknesses from contributions.
 */
function identifyWeaknesses(
  contributions: FeatureContribution[],
  criteria: RoleCriteria
): WeaknessArea[] {
  return contributions
    .filter((c) => c.impact === "negative")
    .slice(0, 5)
    .map((contrib) => {
      const suggestion = getSuggestionForFeature(contrib.feature, criteria);
      return {
        area: contrib.feature,
        currentValue: formatFeatureValue(contrib.feature, contrib.value),
        targetValue: suggestion.target,
        priority: contrib.importance > 10 ? "Critical" as const : contrib.importance > 5 ? "High" as const : "Medium" as const,
        suggestion: suggestion.text,
      };
    });
}

/**
 * Formats feature value for display.
 */
function formatFeatureValue(feature: string, value: number): string {
  switch (feature) {
    case "CGPA": return `${value.toFixed(2)}/10`;
    case "10th Percentage":
    case "12th Percentage":
    case "Resume Score":
    case "Aptitude Score": return `${Math.round(value)}%`;
    case "Has Internship":
    case "Open Source":
    case "Branch Relevance": return value === 1 ? "Yes" : "No";
    case "Communication":
    case "Mock Interview":
    case "English Fluency": return `${value.toFixed(1)}/10`;
    default: return String(Math.round(value));
  }
}

/**
 * Gets improvement suggestion for a feature.
 */
function getSuggestionForFeature(
  feature: string,
  criteria: RoleCriteria
): { target: string; text: string } {
  const suggestions: Record<string, { target: string; text: string }> = {
    "CGPA": { target: `${criteria.academic.minCgpa}+/10`, text: "Focus on core subjects and seek academic guidance" },
    "Backlogs": { target: "0", text: "Clear all backlogs - most companies have strict policies" },
    "DSA Level": { target: "Intermediate+", text: "Practice DSA daily on LeetCode - aim for 200+ problems" },
    "Projects Count": { target: `${criteria.technical.minProjects}+`, text: "Build full-stack projects with real-world applications" },
    "Has Internship": { target: "Yes", text: "Apply for internships - experience is crucial" },
    "Programming Languages": { target: `${criteria.technical.minProgrammingLanguages}+`, text: "Master one language, learn 2-3 others" },
    "Aptitude Score": { target: `${criteria.softSkills.minAptitudeScore}%+`, text: "Practice aptitude daily on IndiaBix, PrepInsta" },
    "Communication": { target: `${criteria.softSkills.minCommunicationScore}/10`, text: "Join speaking clubs, practice mock interviews" },
    "Resume Score": { target: `${criteria.experience.minResumeScore}%`, text: "Use action verbs, quantify achievements" },
  };
  return suggestions[feature] ?? { target: "Improve", text: `Work on improving ${feature.toLowerCase()}` };
}

/**
 * Generates improvement suggestions.
 */
function generateSuggestions(
  weaknesses: WeaknessArea[],
  models: TrainedModels
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

  const topFeatures = models.featureImportance
    .map((imp, i) => ({ name: FEATURE_NAMES[i], importance: imp }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  suggestions.push(
    `📊 ML Analysis: Top factors are ${topFeatures.map((f) => f.name).join(", ")}`
  );

  return suggestions.slice(0, 6);
}

/**
 * Gets risk category.
 */
function getRiskCategory(probability: number): RiskCategory {
  if (probability >= 70) return "Low";
  if (probability >= 40) return "Medium";
  return "High";
}

/**
 * Creates empty candidate profile.
 */
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
      programmingLanguages: [],
      dsaLevel: "Basic",
      projectsCount: 0,
      hasInternship: false,
      certifications: [],
    },
    experience: {
      hackathonsCount: 0,
      hasOpenSourceContributions: false,
      resumeScore: 50,
    },
    softSkills: {
      aptitudeScore: 50,
      communicationScore: 5,
      mockInterviewScore: 5,
      englishFluency: 5,
    },
  };
}

/**
 * Analyzes candidate cluster for peer comparison.
 */
export function analyzeCandidateCluster(profile: CandidateProfile) {
  const models = getTrainedModels();
  const features = extractFeatures(profile);
  
  const normalized = features.map((val, i) => {
    const min = models.normalization.mins[i] ?? 0;
    const max = models.normalization.maxs[i] ?? 1;
    return max === min ? 0.5 : (val - min) / (max - min);
  });

  if (!models.clusters) {
    return { cluster: 0, description: "Analysis unavailable", recommendation: "" };
  }

  let nearestCluster = 0;
  let minDistance = Infinity;

  for (let c = 0; c < models.clusters.centroids.length; c++) {
    const centroid = models.clusters.centroids[c];
    if (!centroid) continue;
    
    let distance = 0;
    for (let i = 0; i < normalized.length; i++) {
      distance += Math.pow((normalized[i] ?? 0) - (centroid[i] ?? 0), 2);
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

/**
 * Gets PCA insights for profile.
 */
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
