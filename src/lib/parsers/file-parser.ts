import * as XLSX from "xlsx";
import type {
  GradeClass,
  ParseResult,
  ParentalEducation,
  ParentalInvolvement,
  RawStudentRecord,
  StudentRecord,
  ValidationError,
} from "@/lib/types/student";

/**
 * Parses a CSV or Excel file buffer into raw records.
 * @param buffer - File buffer (ArrayBuffer)
 * @param fileName - Original file name for type detection
 * @returns Array of raw student records
 */
export function parseFileBuffer(
  buffer: ArrayBuffer,
  fileName: string,
): RawStudentRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("No sheets found in the file");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error("Failed to read worksheet");
  }

  const jsonData = XLSX.utils.sheet_to_json<RawStudentRecord>(worksheet, {
    defval: undefined,
    raw: true,
  });

  return jsonData;
}

/**
 * Normalizes a string value to a boolean.
 * @param value - Input value
 * @returns Boolean interpretation
 */
function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return lower === "yes" || lower === "1" || lower === "true";
  }
  return false;
}

/**
 * Normalizes gender value to standard format.
 * @param value - Raw gender value
 * @returns Normalized gender or null
 */
function normalizeGender(value: unknown): "Male" | "Female" | null {
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    if (lower === "male" || lower === "m" || lower === "0") return "Male";
    if (lower === "female" || lower === "f" || lower === "1") return "Female";
  }
  if (typeof value === "number") {
    return value === 0 ? "Male" : "Female";
  }
  return null;
}

/**
 * Normalizes parental education level.
 * @param value - Raw education value
 * @returns Normalized parental education level
 */
function normalizeParentalEducation(value: unknown): ParentalEducation {
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    if (lower.includes("none") || lower === "0") return "None";
    if (lower.includes("high school") || lower === "1") return "High School";
    if (lower.includes("some college") || lower === "2") return "Some College";
    if (lower.includes("bachelor") || lower === "3") return "Bachelor's";
    if (lower.includes("higher") || lower === "4") return "Higher";
  }
  if (typeof value === "number") {
    const mapping: Record<number, ParentalEducation> = {
      0: "None",
      1: "High School",
      2: "Some College",
      3: "Bachelor's",
      4: "Higher",
    };
    return mapping[value] ?? "High School";
  }
  return "High School";
}

/**
 * Normalizes parental support/involvement level.
 * @param value - Raw support value
 * @returns Normalized parental involvement level
 */
function normalizeParentalSupport(value: unknown): ParentalInvolvement {
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    if (lower === "low" || lower === "0") return "Low";
    if (lower === "medium" || lower === "1" || lower === "moderate")
      return "Medium";
    if (lower === "high" || lower === "2") return "High";
  }
  if (typeof value === "number") {
    if (value <= 1) return "Low";
    if (value <= 3) return "Medium";
    return "High";
  }
  return "Medium";
}

/**
 * Validates and transforms a raw student record.
 * @param raw - Raw record from file
 * @param index - Row index for error reporting
 * @returns Tuple of [StudentRecord | null, ValidationError[]]
 */
function validateAndTransformRecord(
  raw: RawStudentRecord,
  index: number,
): [StudentRecord | null, ValidationError[]] {
  const errors: ValidationError[] = [];

  // Generate ID if not present
  const id = raw.StudentID?.toString() ?? `student-${index + 1}`;

  // Validate age
  const age = Number(raw.Age);
  if (Number.isNaN(age) || age < 10 || age > 30) {
    errors.push({
      row: index + 1,
      field: "Age",
      message: "Age must be a number between 10 and 30",
      value: raw.Age,
    });
  }

  // Validate gender
  const gender = normalizeGender(raw.Gender);
  if (!gender) {
    errors.push({
      row: index + 1,
      field: "Gender",
      message: 'Gender must be "Male" or "Female"',
      value: raw.Gender,
    });
  }

  // Validate ethnicity (0-3)
  const ethnicity = Number(raw.Ethnicity ?? 0);
  if (Number.isNaN(ethnicity) || ethnicity < 0 || ethnicity > 3) {
    errors.push({
      row: index + 1,
      field: "Ethnicity",
      message: "Ethnicity must be a number between 0 and 3",
      value: raw.Ethnicity,
    });
  }

  // Validate study time
  const studyTimeWeekly = Number(raw.StudyTimeWeekly ?? 0);
  if (Number.isNaN(studyTimeWeekly) || studyTimeWeekly < 0) {
    errors.push({
      row: index + 1,
      field: "StudyTimeWeekly",
      message: "Study time must be a non-negative number",
      value: raw.StudyTimeWeekly,
    });
  }

  // Validate absences
  const absences = Number(raw.Absences ?? 0);
  if (Number.isNaN(absences) || absences < 0) {
    errors.push({
      row: index + 1,
      field: "Absences",
      message: "Absences must be a non-negative number",
      value: raw.Absences,
    });
  }

  // Validate GPA
  const gpa = Number(raw.GPA ?? 0);
  if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) {
    errors.push({
      row: index + 1,
      field: "GPA",
      message: "GPA must be a number between 0 and 4",
      value: raw.GPA,
    });
  }

  // Validate grade class if present
  let gradeClass: GradeClass | null = null;
  if (raw.GradeClass !== undefined && raw.GradeClass !== null) {
    const gc = Number(raw.GradeClass);
    if (!Number.isNaN(gc) && gc >= 0 && gc <= 4) {
      gradeClass = gc as GradeClass;
    }
  }

  // If critical errors exist, return null record
  if (errors.some((e) => ["Age", "Gender"].includes(e.field))) {
    return [null, errors];
  }

  const record: StudentRecord = {
    id,
    age: Number.isNaN(age) ? 18 : age,
    gender: gender ?? "Male",
    ethnicity: Number.isNaN(ethnicity) ? 0 : ethnicity,
    parentalEducation: normalizeParentalEducation(raw.ParentalEducation),
    studyTimeWeekly: Number.isNaN(studyTimeWeekly) ? 0 : studyTimeWeekly,
    absences: Number.isNaN(absences) ? 0 : absences,
    tutoring: normalizeBoolean(raw.Tutoring),
    parentalSupport: normalizeParentalSupport(raw.ParentalSupport),
    extracurricular: normalizeBoolean(raw.Extracurricular),
    sports: normalizeBoolean(raw.Sports),
    music: normalizeBoolean(raw.Music),
    volunteering: normalizeBoolean(raw.Volunteering),
    gpa: Number.isNaN(gpa) ? 0 : gpa,
    gradeClass,
  };

  return [record, errors];
}

/**
 * Parses and validates a complete file into student records.
 * @param buffer - File buffer
 * @param fileName - Original file name
 * @returns ParseResult with records and errors
 */
export function parseStudentFile(
  buffer: ArrayBuffer,
  fileName: string,
): ParseResult {
  const rawRecords = parseFileBuffer(buffer, fileName);
  const records: StudentRecord[] = [];
  const errors: ValidationError[] = [];

  for (let i = 0; i < rawRecords.length; i++) {
    const raw = rawRecords[i];
    if (!raw) continue;

    const [record, recordErrors] = validateAndTransformRecord(raw, i);
    errors.push(...recordErrors);

    if (record) {
      records.push(record);
    }
  }

  return {
    records,
    errors,
    totalRows: rawRecords.length,
    successfulRows: records.length,
  };
}
