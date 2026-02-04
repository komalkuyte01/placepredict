"use server";

import { parseStudentFile } from "@/lib/parsers/file-parser";
import { predictionEngine } from "@/lib/ml/prediction-engine";
import type {
  DatasetStatistics,
  ParseResult,
  PredictionResult,
  StudentRecord,
  ValidationError,
} from "@/lib/types/student";

/**
 * Column-level validation error for UI display.
 */
export interface ColumnValidationError {
  /** Column name that failed validation */
  column: string;
  /** Error message */
  message: string;
  /** Value that caused the error */
  invalidValue: string;
  /** Expected format/range */
  expected: string;
  /** Row number where error occurred */
  row: number;
}

/**
 * Maps validation errors to column-specific format with expected values.
 */
function mapToColumnErrors(errors: ValidationError[]): ColumnValidationError[] {
  const expectedFormats: Record<string, string> = {
    Age: "10 - 30",
    Gender: '"Male" | "Female"',
    Ethnicity: "0 - 3",
    ParentalEducation: '"None" | "High School" | "Some College" | "Bachelor\'s" | "Higher"',
    StudyTimeWeekly: "0 - 40",
    Absences: "0+",
    Tutoring: '"Yes" | "No"',
    ParentalSupport: '"Low" | "Medium" | "High"',
    Extracurricular: '"Yes" | "No"',
    Sports: '"Yes" | "No"',
    Music: '"Yes" | "No"',
    Volunteering: '"Yes" | "No"',
    GPA: "0.0 - 4.0",
    GradeClass: "0 - 4",
  };

  return errors.map((error) => ({
    column: error.field,
    message: error.message,
    invalidValue: String(error.value ?? ""),
    expected: expectedFormats[error.field] ?? "valid value",
    row: error.row,
  }));
}

/**
 * Server action response type for file processing.
 */
export interface ProcessFileResponse {
  success: boolean;
  data?: {
    parseResult: ParseResult;
    predictions: PredictionResult[];
    statistics: DatasetStatistics;
  };
  error?: string;
  /** Column-level validation errors for detailed UI display */
  columnErrors?: ColumnValidationError[];
}

/**
 * Processes an uploaded student data file.
 * Parses, validates, and generates predictions server-side.
 * @param formData - Form data containing the uploaded file
 * @returns Processing result with predictions and statistics
 */
export async function processStudentFile(
  formData: FormData,
): Promise<ProcessFileResponse> {
  try {
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "No file provided or invalid file type",
      };
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!hasValidExtension) {
      return {
        success: false,
        error: "Invalid file type. Please upload a CSV or Excel file.",
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Maximum size is 10MB.",
      };
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();

    // Parse the file
    const parseResult = parseStudentFile(buffer, file.name);

    // Convert validation errors to column-level errors for UI
    const columnErrors = mapToColumnErrors(parseResult.errors);

    if (parseResult.records.length === 0) {
      return {
        success: false,
        error:
          parseResult.errors.length > 0
            ? `Failed to parse any valid records. Found ${parseResult.errors.length} validation error(s).`
            : "No valid student records found in the file.",
        columnErrors: columnErrors.length > 0 ? columnErrors : undefined,
      };
    }

    // Train the model if we have labeled data
    const labeledRecords = parseResult.records.filter(
      (r) => r.gradeClass !== null,
    );
    if (labeledRecords.length > 0) {
      predictionEngine.train(parseResult.records);
    }

    // Generate predictions
    const predictions = predictionEngine.predictBatch(parseResult.records);

    // Calculate statistics
    const statistics = predictionEngine.calculateStatistics(
      parseResult.records,
    );

    return {
      success: true,
      data: {
        parseResult,
        predictions,
        statistics,
      },
      // Include column errors as warnings even on success
      columnErrors: columnErrors.length > 0 ? columnErrors : undefined,
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing the file.",
    };
  }
}

/**
 * Predicts performance for a single student record.
 * @param student - Student record to predict
 * @returns Prediction result
 */
export async function predictSingleStudent(
  student: StudentRecord,
): Promise<PredictionResult> {
  return predictionEngine.predict(student);
}

/**
 * Calculates statistics for a set of student records.
 * @param students - Array of student records
 * @returns Dataset statistics
 */
export async function calculateDatasetStatistics(
  students: StudentRecord[],
): Promise<DatasetStatistics> {
  return predictionEngine.calculateStatistics(students);
}
