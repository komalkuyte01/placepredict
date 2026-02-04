/**
 * Core type definitions for student performance data.
 * Based on the Kaggle Student Performance Prediction dataset schema.
 * @see https://www.kaggle.com/datasets/prajwalkanade/student-performance-prediction-dataset
 */

/**
 * Gender classification for students.
 */
export type Gender = "Male" | "Female";

/**
 * Parental education level categories.
 */
export type ParentalEducation =
  | "None"
  | "High School"
  | "Some College"
  | "Bachelor's"
  | "Higher";

/**
 * Level of parental involvement in education.
 */
export type ParentalInvolvement = "Low" | "Medium" | "High";

/**
 * Access level to educational resources.
 */
export type ResourceAccess = "Low" | "Medium" | "High";

/**
 * Student motivation level classification.
 */
export type MotivationLevel = "Low" | "Medium" | "High";

/**
 * Family income bracket classification.
 */
export type FamilyIncome = "Low" | "Medium" | "High";

/**
 * Teacher quality rating.
 */
export type TeacherQuality = "Low" | "Medium" | "High";

/**
 * Peer influence on student performance.
 */
export type PeerInfluence = "Negative" | "Neutral" | "Positive";

/**
 * Type of school attended.
 */
export type SchoolType = "Public" | "Private";

/**
 * Distance from home to school.
 */
export type DistanceFromHome = "Near" | "Moderate" | "Far";

/**
 * Learning disabilities indicator.
 */
export type LearningDisabilities = "Yes" | "No";

/**
 * Extracurricular activities participation.
 */
export type ExtracurricularActivities = "Yes" | "No";

/**
 * Sports participation indicator.
 */
export type Sports = "Yes" | "No";

/**
 * Music participation indicator.
 */
export type Music = "Yes" | "No";

/**
 * Volunteering participation indicator.
 */
export type Volunteering = "Yes" | "No";

/**
 * Grade class prediction outcomes.
 */
export type GradeClass = 0 | 1 | 2 | 3 | 4;

/**
 * Human-readable grade labels.
 */
export const GRADE_LABELS: Record<GradeClass, string> = {
  0: "A (90-100)",
  1: "B (80-89)",
  2: "C (70-79)",
  3: "D (60-69)",
  4: "F (0-59)",
};

/**
 * Raw student record as parsed from CSV/Excel files.
 * All fields are optional to handle partial data.
 */
export interface RawStudentRecord {
  StudentID?: string | number;
  Age?: number;
  Gender?: string;
  Ethnicity?: string | number;
  ParentalEducation?: string;
  StudyTimeWeekly?: number;
  Absences?: number;
  Tutoring?: string;
  ParentalSupport?: string;
  Extracurricular?: string;
  Sports?: string;
  Music?: string;
  Volunteering?: string;
  GPA?: number;
  GradeClass?: number;
  [key: string]: unknown;
}

/**
 * Validated and normalized student record.
 */
export interface StudentRecord {
  /** Unique identifier for the student */
  id: string;
  /** Student age in years */
  age: number;
  /** Student gender */
  gender: Gender;
  /** Ethnicity code (0-3) */
  ethnicity: number;
  /** Parental education level */
  parentalEducation: ParentalEducation;
  /** Weekly study time in hours */
  studyTimeWeekly: number;
  /** Number of absences */
  absences: number;
  /** Whether student receives tutoring */
  tutoring: boolean;
  /** Level of parental support */
  parentalSupport: ParentalInvolvement;
  /** Participation in extracurricular activities */
  extracurricular: boolean;
  /** Sports participation */
  sports: boolean;
  /** Music participation */
  music: boolean;
  /** Volunteering participation */
  volunteering: boolean;
  /** Current GPA (0.0 - 4.0) */
  gpa: number;
  /** Predicted or actual grade class */
  gradeClass: GradeClass | null;
}

/**
 * Prediction result for a single student.
 */
export interface PredictionResult {
  /** Student identifier */
  studentId: string;
  /** Predicted grade class */
  predictedGrade: GradeClass;
  /** Confidence probability for each grade class */
  probabilities: Record<GradeClass, number>;
  /** Risk level assessment */
  riskLevel: "low" | "medium" | "high";
  /** Key factors influencing the prediction */
  keyFactors: PredictionFactor[];
}

/**
 * Factor contributing to a prediction.
 */
export interface PredictionFactor {
  /** Feature name */
  feature: string;
  /** Impact direction on prediction */
  impact: "positive" | "negative" | "neutral";
  /** Weight/importance of this factor */
  weight: number;
  /** Human-readable description */
  description: string;
}

/**
 * Aggregated statistics for a dataset.
 */
export interface DatasetStatistics {
  /** Total number of records */
  totalStudents: number;
  /** Average GPA across all students */
  averageGpa: number;
  /** GPA standard deviation */
  gpaStdDev: number;
  /** Average weekly study time */
  averageStudyTime: number;
  /** Average number of absences */
  averageAbsences: number;
  /** Distribution of students by grade class */
  gradeDistribution: Record<GradeClass, number>;
  /** Gender distribution */
  genderDistribution: Record<Gender, number>;
  /** Feature correlations with GPA */
  featureCorrelations: FeatureCorrelation[];
}

/**
 * Correlation data between a feature and GPA.
 */
export interface FeatureCorrelation {
  /** Feature name */
  feature: string;
  /** Pearson correlation coefficient */
  correlation: number;
  /** Strength classification */
  strength: "weak" | "moderate" | "strong";
}

/**
 * Validation error for a student record.
 */
export interface ValidationError {
  /** Row index in the original file */
  row: number;
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Original value that caused the error */
  value: unknown;
}

/**
 * Result of parsing and validating a file.
 */
export interface ParseResult {
  /** Successfully parsed records */
  records: StudentRecord[];
  /** Validation errors encountered */
  errors: ValidationError[];
  /** Total rows processed */
  totalRows: number;
  /** Number of successfully parsed rows */
  successfulRows: number;
}
