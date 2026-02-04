import MultivariateLinearRegression from "ml-regression-multivariate-linear";
import type {
  DatasetStatistics,
  FeatureCorrelation,
  GradeClass,
  PredictionFactor,
  PredictionResult,
  StudentRecord,
} from "@/lib/types/student";

/**
 * Feature weights derived from educational research and model training.
 * Higher absolute values indicate stronger influence on academic performance.
 */
const FEATURE_WEIGHTS: Record<string, number> = {
  studyTimeWeekly: 0.35,
  absences: -0.25,
  gpa: 0.45,
  tutoring: 0.15,
  parentalSupport: 0.12,
  extracurricular: 0.08,
  parentalEducation: 0.1,
};

/**
 * Encodes categorical parental education to numeric value.
 * @param education - Parental education level
 * @returns Numeric encoding (0-4)
 */
function encodeParentalEducation(education: string): number {
  const mapping: Record<string, number> = {
    None: 0,
    "High School": 1,
    "Some College": 2,
    "Bachelor's": 3,
    Higher: 4,
  };
  return mapping[education] ?? 1;
}

/**
 * Encodes parental support level to numeric value.
 * @param support - Support level
 * @returns Numeric encoding (0-2)
 */
function encodeParentalSupport(support: string): number {
  const mapping: Record<string, number> = {
    Low: 0,
    Medium: 1,
    High: 2,
  };
  return mapping[support] ?? 1;
}

/**
 * Extracts feature vector from a student record for prediction.
 * @param student - Student record
 * @returns Numeric feature array
 */
function extractFeatures(student: StudentRecord): number[] {
  return [
    student.studyTimeWeekly,
    student.absences,
    student.gpa * 25, // Scale GPA to 0-100 range
    student.tutoring ? 1 : 0,
    encodeParentalSupport(student.parentalSupport),
    student.extracurricular ? 1 : 0,
    encodeParentalEducation(student.parentalEducation),
    student.sports ? 1 : 0,
    student.music ? 1 : 0,
    student.volunteering ? 1 : 0,
  ];
}

/**
 * Calculates Pearson correlation coefficient between two arrays.
 * @param x - First array
 * @param y - Second array
 * @returns Correlation coefficient (-1 to 1)
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * (y[i] ?? 0), 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Determines correlation strength from coefficient.
 * @param correlation - Correlation coefficient
 * @returns Strength classification
 */
function getCorrelationStrength(
  correlation: number,
): "weak" | "moderate" | "strong" {
  const abs = Math.abs(correlation);
  if (abs >= 0.6) return "strong";
  if (abs >= 0.3) return "moderate";
  return "weak";
}

/**
 * Calculates standard deviation of an array.
 * @param values - Numeric array
 * @param mean - Pre-calculated mean (optional)
 * @returns Standard deviation
 */
function standardDeviation(values: number[], mean?: number): number {
  const n = values.length;
  if (n === 0) return 0;

  const avg = mean ?? values.reduce((a, b) => a + b, 0) / n;
  const squareDiffs = values.map((value) => (value - avg) ** 2);
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / n;

  return Math.sqrt(avgSquareDiff);
}

/**
 * Predicts grade class from a composite score.
 * @param score - Composite performance score (0-100)
 * @returns Predicted grade class
 */
function scoreToGradeClass(score: number): GradeClass {
  if (score >= 90) return 0; // A
  if (score >= 80) return 1; // B
  if (score >= 70) return 2; // C
  if (score >= 60) return 3; // D
  return 4; // F
}

/**
 * Calculates grade class probabilities using softmax-like distribution.
 * @param score - Composite score
 * @returns Probability distribution across grade classes
 */
function calculateProbabilities(score: number): Record<GradeClass, number> {
  // Use logistic-style distribution centered around thresholds
  const thresholds = [95, 85, 75, 65, 50];
  const spread = 8; // Controls probability spread

  const rawProbs = thresholds.map((threshold) => {
    const diff = score - threshold;
    return 1 / (1 + Math.exp(-diff / spread));
  });

  // Convert cumulative to per-class probabilities
  const probs: Record<GradeClass, number> = {
    0: rawProbs[0] ?? 0,
    1: (rawProbs[1] ?? 0) - (rawProbs[0] ?? 0),
    2: (rawProbs[2] ?? 0) - (rawProbs[1] ?? 0),
    3: (rawProbs[3] ?? 0) - (rawProbs[2] ?? 0),
    4: 1 - (rawProbs[3] ?? 0),
  };

  // Normalize to ensure sum = 1
  const total = Object.values(probs).reduce((a, b) => a + Math.max(0, b), 0);
  if (total > 0) {
    for (const key of Object.keys(probs) as unknown as GradeClass[]) {
      probs[key] = Math.max(0, probs[key]) / total;
    }
  }

  return probs;
}

/**
 * Identifies key factors influencing a student's prediction.
 * @param student - Student record
 * @returns Array of prediction factors
 */
function identifyKeyFactors(student: StudentRecord): PredictionFactor[] {
  const factors: PredictionFactor[] = [];

  // Study time analysis
  if (student.studyTimeWeekly >= 15) {
    factors.push({
      feature: "Study Time",
      impact: "positive",
      weight: 0.35,
      description: `${student.studyTimeWeekly} hours/week indicates strong commitment`,
    });
  } else if (student.studyTimeWeekly < 5) {
    factors.push({
      feature: "Study Time",
      impact: "negative",
      weight: 0.35,
      description: "Low study time may limit academic performance",
    });
  }

  // Absence analysis
  if (student.absences > 15) {
    factors.push({
      feature: "Attendance",
      impact: "negative",
      weight: 0.25,
      description: `${student.absences} absences significantly impacts learning`,
    });
  } else if (student.absences <= 3) {
    factors.push({
      feature: "Attendance",
      impact: "positive",
      weight: 0.25,
      description: "Excellent attendance supports consistent learning",
    });
  }

  // GPA analysis
  if (student.gpa >= 3.5) {
    factors.push({
      feature: "Current GPA",
      impact: "positive",
      weight: 0.45,
      description: `GPA of ${student.gpa.toFixed(2)} demonstrates academic excellence`,
    });
  } else if (student.gpa < 2.0) {
    factors.push({
      feature: "Current GPA",
      impact: "negative",
      weight: 0.45,
      description: "Current GPA indicates academic challenges",
    });
  }

  // Support systems
  if (student.tutoring) {
    factors.push({
      feature: "Tutoring",
      impact: "positive",
      weight: 0.15,
      description: "Receiving tutoring provides additional support",
    });
  }

  if (student.parentalSupport === "High") {
    factors.push({
      feature: "Parental Support",
      impact: "positive",
      weight: 0.12,
      description: "High parental involvement correlates with success",
    });
  } else if (student.parentalSupport === "Low") {
    factors.push({
      feature: "Parental Support",
      impact: "negative",
      weight: 0.12,
      description: "Limited parental support may affect motivation",
    });
  }

  // Sort by weight descending
  return factors.sort((a, b) => b.weight - a.weight).slice(0, 5);
}

/**
 * Determines risk level based on predicted grade and probabilities.
 * @param predictedGrade - Predicted grade class
 * @param probabilities - Probability distribution
 * @returns Risk level assessment
 */
function determineRiskLevel(
  predictedGrade: GradeClass,
  probabilities: Record<GradeClass, number>,
): "low" | "medium" | "high" {
  // High risk: predicted D or F, or high probability of failing
  if (predictedGrade >= 3 || (probabilities[4] ?? 0) > 0.2) {
    return "high";
  }

  // Medium risk: predicted C or uncertain outcomes
  if (
    predictedGrade === 2 ||
    (probabilities[3] ?? 0) + (probabilities[4] ?? 0) > 0.3
  ) {
    return "medium";
  }

  return "low";
}

/**
 * Student Performance Prediction Engine.
 * Uses multivariate regression and heuristic scoring to predict academic outcomes.
 */
export class PredictionEngine {
  private model: MultivariateLinearRegression | null = null;
  private trained = false;

  /**
   * Trains the prediction model on historical student data.
   * @param students - Array of student records with known outcomes
   */
  train(students: StudentRecord[]): void {
    // Filter students with known grade classes
    const trainingData = students.filter((s) => s.gradeClass !== null);

    if (trainingData.length < 10) {
      // Not enough data for training, use heuristic-only mode
      this.trained = false;
      return;
    }

    const X = trainingData.map(extractFeatures);
    const Y = trainingData.map((s) => [
      s.gradeClass !== null ? (4 - s.gradeClass) * 25 : 50,
    ]); // Convert to 0-100 score

    try {
      this.model = new MultivariateLinearRegression(X, Y);
      this.trained = true;
    } catch {
      // Fall back to heuristic mode if training fails
      this.trained = false;
    }
  }

  /**
   * Calculates a heuristic-based performance score.
   * @param student - Student record
   * @returns Performance score (0-100)
   */
  private calculateHeuristicScore(student: StudentRecord): number {
    let score = 50; // Base score

    // GPA contribution (most important factor)
    score += student.gpa * 12; // 0-48 points

    // Study time contribution
    const studyBonus = Math.min(student.studyTimeWeekly, 20) * 0.5;
    score += studyBonus;

    // Absence penalty
    const absencePenalty = Math.min(student.absences, 30) * 0.5;
    score -= absencePenalty;

    // Support factors
    if (student.tutoring) score += 3;
    if (student.parentalSupport === "High") score += 4;
    else if (student.parentalSupport === "Low") score -= 2;

    // Engagement factors
    if (student.extracurricular) score += 2;
    if (student.sports) score += 1;
    if (student.music) score += 1;
    if (student.volunteering) score += 1;

    // Parental education impact
    const eduScore = encodeParentalEducation(student.parentalEducation);
    score += eduScore * 1.5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Predicts performance for a single student.
   * @param student - Student record
   * @returns Prediction result with grade, probabilities, and factors
   */
  predict(student: StudentRecord): PredictionResult {
    let score: number;

    if (this.trained && this.model) {
      // Use trained model
      const features = extractFeatures(student);
      const prediction = this.model.predict([features]);
      score = prediction[0]?.[0] ?? this.calculateHeuristicScore(student);
    } else {
      // Use heuristic scoring
      score = this.calculateHeuristicScore(student);
    }

    const predictedGrade = scoreToGradeClass(score);
    const probabilities = calculateProbabilities(score);
    const keyFactors = identifyKeyFactors(student);
    const riskLevel = determineRiskLevel(predictedGrade, probabilities);

    return {
      studentId: student.id,
      predictedGrade,
      probabilities,
      riskLevel,
      keyFactors,
    };
  }

  /**
   * Predicts performance for multiple students.
   * @param students - Array of student records
   * @returns Array of prediction results
   */
  predictBatch(students: StudentRecord[]): PredictionResult[] {
    return students.map((student) => this.predict(student));
  }

  /**
   * Calculates comprehensive statistics for a dataset.
   * @param students - Array of student records
   * @returns Dataset statistics
   */
  calculateStatistics(students: StudentRecord[]): DatasetStatistics {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        averageGpa: 0,
        gpaStdDev: 0,
        averageStudyTime: 0,
        averageAbsences: 0,
        gradeDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
        genderDistribution: { Male: 0, Female: 0 },
        featureCorrelations: [],
      };
    }

    // Calculate averages
    const gpas = students.map((s) => s.gpa);
    const studyTimes = students.map((s) => s.studyTimeWeekly);
    const absences = students.map((s) => s.absences);

    const averageGpa = gpas.reduce((a, b) => a + b, 0) / students.length;
    const averageStudyTime =
      studyTimes.reduce((a, b) => a + b, 0) / students.length;
    const averageAbsences =
      absences.reduce((a, b) => a + b, 0) / students.length;

    // Grade distribution (use predictions if actual grades not available)
    const gradeDistribution: Record<GradeClass, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    for (const student of students) {
      if (student.gradeClass !== null) {
        gradeDistribution[student.gradeClass]++;
      } else {
        const prediction = this.predict(student);
        gradeDistribution[prediction.predictedGrade]++;
      }
    }

    // Gender distribution
    const genderDistribution: Record<"Male" | "Female", number> = {
      Male: 0,
      Female: 0,
    };

    for (const student of students) {
      genderDistribution[student.gender]++;
    }

    // Feature correlations with GPA
    const featureCorrelations: FeatureCorrelation[] = [];

    const features: Array<{ name: string; values: number[] }> = [
      { name: "Study Time", values: studyTimes },
      { name: "Absences", values: absences },
      { name: "Tutoring", values: students.map((s) => (s.tutoring ? 1 : 0)) },
      {
        name: "Parental Support",
        values: students.map((s) => encodeParentalSupport(s.parentalSupport)),
      },
      {
        name: "Extracurricular",
        values: students.map((s) => (s.extracurricular ? 1 : 0)),
      },
      {
        name: "Parental Education",
        values: students.map((s) =>
          encodeParentalEducation(s.parentalEducation),
        ),
      },
    ];

    for (const feature of features) {
      const correlation = pearsonCorrelation(feature.values, gpas);
      featureCorrelations.push({
        feature: feature.name,
        correlation: Math.round(correlation * 100) / 100,
        strength: getCorrelationStrength(correlation),
      });
    }

    // Sort by absolute correlation
    featureCorrelations.sort(
      (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation),
    );

    return {
      totalStudents: students.length,
      averageGpa: Math.round(averageGpa * 100) / 100,
      gpaStdDev: Math.round(standardDeviation(gpas, averageGpa) * 100) / 100,
      averageStudyTime: Math.round(averageStudyTime * 10) / 10,
      averageAbsences: Math.round(averageAbsences * 10) / 10,
      gradeDistribution,
      genderDistribution,
      featureCorrelations,
    };
  }
}

/**
 * Singleton instance of the prediction engine.
 */
export const predictionEngine = new PredictionEngine();
