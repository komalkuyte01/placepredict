/**
 * ML-Powered Placement Prediction Engine
 *
 * Trains an ensemble of Logistic Regression, Random Forest, and KNN models
 * on curated placement data, and uses their weighted predictions to assess
 * a candidate's placement probability for Software Developer roles.
 */

import LogisticRegression from "ml-logistic-regression";
import { Matrix } from "ml-matrix";
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
  "Is CGPA Below 7.5",
  "Is 12th Below 60%",
  "Is Skills Below 5",
  "Is Projects Below 2",
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

/**
 * Takes the base 17 features (from generated data or profile) and applies 
 * hard-coded business rules (like low CGPA) as binary features so the ML 
 * models can natively learn to penalize them.
 */
function transformFeaturesIteratively(features: number[]): number[] {
  const cgpa = features[0] ?? 0;
  const isCgpaBelow75 = cgpa > 0 && cgpa < 7.5 ? 1 : 0;
  const twelfthPct = features[3] ?? 0;
  const isTwelfthBelow60 = twelfthPct > 0 && twelfthPct < 60 ? 1 : 0;
  const skillCount = features[5] ?? 0;
  const isSkillsBelow5 = skillCount < 5 ? 1 : 0;
  const projectCount = features[7] ?? 0;
  const isProjectsBelow2 = projectCount < 2 ? 1 : 0;

  return [
    ...features,
    isCgpaBelow75,
    isTwelfthBelow60,
    isSkillsBelow5,
    isProjectsBelow2,
  ];
}

/** Extracts a 21-dimensional numeric feature vector from a candidate profile. */
export function extractFeatures(profile: CandidateProfile): number[] {
  const baseFeatures = [
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

  return transformFeaturesIteratively(baseFeatures);
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
      features: transformFeaturesIteratively(d.features),
      label: d.label,
    }),
  );
}

/** Container holding all trained model instances and normalization metadata. */
export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

interface TrainedModels {
  logisticRegression: unknown;
  randomForest: unknown;
  featureImportance: number[];
  featureNames: string[];
  normalization: { mins: number[]; maxs: number[] };
  cvMetrics: {
    lr: EvaluationMetrics;
    rf: EvaluationMetrics;
    ensemble: EvaluationMetrics;
  };
}

/** Trains Logistic Regression and Random Forest using 5-Fold CV, then retrains on full dataset. */
export function trainModels(trainingData: TrainingDataPoint[]): TrainedModels {
  const shuffled = [...trainingData].sort(() => Math.random() - 0.5);
  const kFolds = 5;
  const foldSize = Math.floor(shuffled.length / kFolds);

  let lrMetricsSum = { accuracy: 0, precision: 0, recall: 0, f1: 0 };
  let rfMetricsSum = { accuracy: 0, precision: 0, recall: 0, f1: 0 };
  let ensMetricsSum = { accuracy: 0, precision: 0, recall: 0, f1: 0 };

  // 1. Cross-Validation Phase for accurate reporting
  for (let k = 0; k < kFolds; k++) {
    const testStart = k * foldSize;
    const testEnd = k === kFolds - 1 ? shuffled.length : testStart + foldSize;
    
    const testSplit = shuffled.slice(testStart, testEnd);
    const trainSplit = [...shuffled.slice(0, testStart), ...shuffled.slice(testEnd)];

    const { normalized: normTrainFeatures, mins, maxs } = normalizeFeatures(trainSplit.map(d => d.features));
    const trainLabels = trainSplit.map((d) => d.label);

    const lr = new LogisticRegression({ numSteps: 500, learningRate: 0.1 });
    lr.train(new Matrix(normTrainFeatures), Matrix.columnVector(trainLabels));

    const rf = new RandomForestClassifier({ nEstimators: 30, maxFeatures: 0.8, replacement: true, seed: 42 });
    rf.train(normTrainFeatures, trainLabels);

    const normTestFeatures = testSplit.map(d => normalizeSingleFeature(d.features, mins, maxs));
    const testLabels = testSplit.map(d => d.label);

    const lrPreds = getLogisticPositiveProbabilities(lr, normTestFeatures).map(
      (p) => (p >= 0.5 ? 1 : 0),
    );
    const rfPreds = (rf as any).predictProbability(normTestFeatures, 1).map((p: number) => p >= 0.5 ? 1 : 0);
    const ensPreds = normTestFeatures.map((f) => {
      const lrProb = getLogisticPositiveProbabilities(lr, [f])[0] ?? 0;
      const rfProb = (rf as any).predictProbability([f], 1)[0];
      return (rfProb * 0.7 + lrProb * 0.3) >= 0.5 ? 1 : 0;
    });

    const mLR = calculateMetrics(lrPreds, testLabels);
    const mRF = calculateMetrics(rfPreds, testLabels);
    const mEns = calculateMetrics(ensPreds, testLabels);

    lrMetricsSum = { accuracy: lrMetricsSum.accuracy + mLR.accuracy, precision: lrMetricsSum.precision + mLR.precision, recall: lrMetricsSum.recall + mLR.recall, f1: lrMetricsSum.f1 + mLR.f1 };
    rfMetricsSum = { accuracy: rfMetricsSum.accuracy + mRF.accuracy, precision: rfMetricsSum.precision + mRF.precision, recall: rfMetricsSum.recall + mRF.recall, f1: rfMetricsSum.f1 + mRF.f1 };
    ensMetricsSum = { accuracy: ensMetricsSum.accuracy + mEns.accuracy, precision: ensMetricsSum.precision + mEns.precision, recall: ensMetricsSum.recall + mEns.recall, f1: ensMetricsSum.f1 + mEns.f1 };
  }

  // Average metrics
  const cvMetrics = {
    lr: { accuracy: lrMetricsSum.accuracy / kFolds, precision: lrMetricsSum.precision / kFolds, recall: lrMetricsSum.recall / kFolds, f1: lrMetricsSum.f1 / kFolds },
    rf: { accuracy: rfMetricsSum.accuracy / kFolds, precision: rfMetricsSum.precision / kFolds, recall: rfMetricsSum.recall / kFolds, f1: rfMetricsSum.f1 / kFolds },
    ensemble: { accuracy: ensMetricsSum.accuracy / kFolds, precision: ensMetricsSum.precision / kFolds, recall: ensMetricsSum.recall / kFolds, f1: ensMetricsSum.f1 / kFolds }
  };

  // 2. Train Final Model on 100% Data
  const fullFeatures = trainingData.map(d => d.features);
  const fullLabels = trainingData.map(d => d.label);
  const { normalized: normFullFeatures, mins: fullMins, maxs: fullMaxs } = normalizeFeatures(fullFeatures);

  const finalLr = new LogisticRegression({ numSteps: 1000, learningRate: 0.1 });
  finalLr.train(new Matrix(normFullFeatures), Matrix.columnVector(fullLabels));

  const finalRf = new RandomForestClassifier({ nEstimators: 50, maxFeatures: 0.8, replacement: true, seed: 42 });
  finalRf.train(normFullFeatures, fullLabels);

  const featureImportance = calculateFeatureImportance(finalRf, normFullFeatures, fullLabels);

  return {
    logisticRegression: finalLr,
    randomForest: finalRf,
    featureImportance,
    featureNames: FEATURE_NAMES,
    normalization: { mins: fullMins, maxs: fullMaxs },
    cvMetrics
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

/** General purpose evaluation metrics generator (Precision, Recall, F1). */
function calculateMetrics(predictions: number[], labels: number[]): EvaluationMetrics {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let i = 0; i < labels.length; i++) {
    if (predictions[i] === 1 && labels[i] === 1) tp++;
    else if (predictions[i] === 0 && labels[i] === 0) tn++;
    else if (predictions[i] === 1 && labels[i] === 0) fp++;
    else if (predictions[i] === 0 && labels[i] === 1) fn++;
  }
  const accuracy = (tp + tn) / labels.length;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  return { accuracy, precision, recall, f1 };
}

/**
 * Computes probability of the positive class (label=1) for ml-logistic-regression.
 *
 * The installed package exposes `testScores` on internal one-vs-all classifiers,
 * not on the outer LogisticRegression instance.
 */
function getLogisticPositiveProbabilities(
  model: unknown,
  features: number[][],
): number[] {
  const matrix = new Matrix(features);
  const lrModel = model as {
    classifiers?: Array<{
      testScores?: (x: Matrix) => number[];
    }>;
    predict?: (x: Matrix) => number[];
  };

  const class0Scores = lrModel.classifiers?.[0]?.testScores?.(matrix);
  const class1Scores = lrModel.classifiers?.[1]?.testScores?.(matrix);

  // For this library, class 0 one-vs-all score approximates P(label=1).
  if (class0Scores && class1Scores) {
    return class0Scores.map((s0, i) => {
      const s1 = class1Scores[i] ?? 0;
      const p = (s0 + (1 - s1)) / 2;
      return Math.max(0, Math.min(1, p));
    });
  }

  if (class0Scores) {
    return class0Scores.map((p) => Math.max(0, Math.min(1, p)));
  }

  // Fallback: if scores are unavailable, use hard predictions as 0/1 probabilities.
  const labels = lrModel.predict?.(matrix) ?? [];
  return labels.map((label) => (label === 1 ? 1 : 0));
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
 * Normalizes a single feature vector without any manual weighting,
 * clamping out-of-range inputs to [0, 1] bounds.
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
    // Clamp to [0, 1] to prevent new users from breaking the distribution
    return Math.max(0, Math.min(1, normalized));
  });
}

/**
 * Main prediction function using ML ensemble.
 * Uses a weighted ensemble: Random Forest (70%) and Logistic Regression (30%).
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

  // Run predictions through each model to get PROBABILITIES (0.0 to 1.0)
  const rfProbs = (models.randomForest as any).predictProbability([normalizedFeatures], 1);
  const rfPrediction = rfProbs[0] ?? 0;

  const lrProbs = getLogisticPositiveProbabilities(models.logisticRegression, [
    normalizedFeatures,
  ]);
  const lrPrediction = lrProbs[0] ?? 0;

  // Weighted ensemble: RF 70%, LR 30%
  // ensembleScore is a true continuous probability between 0 and 1
  const ensembleScore = rfPrediction * 0.7 + lrPrediction * 0.3;

  // Convert to 0-100 percentage
  const probability = ensembleScore * 100;

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
      featureImportance: models.featureImportance.map((imp, i) => ({
        feature: FEATURE_NAMES[i] ?? `Feature ${i}`,
        importance: imp,
      })),
      cvMetrics: models.cvMetrics as any,
    },
  };
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


