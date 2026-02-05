import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Schema field definition for display.
 */
interface SchemaField {
  /** Column name in the CSV/Excel file */
  name: string;
  /** Data type description */
  type: string;
  /** Whether the field is required */
  required: boolean;
  /** Valid range or accepted values */
  validRange: string;
  /** Example valid value */
  example: string;
  /** Brief description */
  description: string;
}

/**
 * Complete schema definition for student data.
 */
const STUDENT_SCHEMA: SchemaField[] = [
  {
    name: "StudentID",
    type: "string | number",
    required: false,
    validRange: "Any unique identifier",
    example: "1",
    description: "Unique student identifier (auto-generated if missing)",
  },
  {
    name: "Age",
    type: "number",
    required: true,
    validRange: "10 - 30",
    example: "17",
    description: "Student age in years",
  },
  {
    name: "Gender",
    type: "string",
    required: true,
    validRange: '"Male" | "Female" | "M" | "F"',
    example: "Female",
    description: "Student gender",
  },
  {
    name: "Ethnicity",
    type: "number",
    required: false,
    validRange: "0 - 3",
    example: "1",
    description: "Ethnicity category code",
  },
  {
    name: "ParentalEducation",
    type: "string",
    required: false,
    validRange: '"None" | "High School" | "Some College" | "Bachelor\'s" | "Higher"',
    example: "Bachelor's",
    description: "Highest education level of parents",
  },
  {
    name: "StudyTimeWeekly",
    type: "number",
    required: false,
    validRange: "0 - 40",
    example: "15",
    description: "Weekly study hours",
  },
  {
    name: "Absences",
    type: "number",
    required: false,
    validRange: "0+",
    example: "3",
    description: "Number of class absences",
  },
  {
    name: "Tutoring",
    type: "string | boolean",
    required: false,
    validRange: '"Yes" | "No" | true | false',
    example: "Yes",
    description: "Whether student receives tutoring",
  },
  {
    name: "ParentalSupport",
    type: "string",
    required: false,
    validRange: '"Low" | "Medium" | "High"',
    example: "High",
    description: "Level of parental involvement",
  },
  {
    name: "Extracurricular",
    type: "string | boolean",
    required: false,
    validRange: '"Yes" | "No" | true | false',
    example: "Yes",
    description: "Participation in extracurricular activities",
  },
  {
    name: "Sports",
    type: "string | boolean",
    required: false,
    validRange: '"Yes" | "No" | true | false',
    example: "No",
    description: "Sports participation",
  },
  {
    name: "Music",
    type: "string | boolean",
    required: false,
    validRange: '"Yes" | "No" | true | false',
    example: "Yes",
    description: "Music participation",
  },
  {
    name: "Volunteering",
    type: "string | boolean",
    required: false,
    validRange: '"Yes" | "No" | true | false',
    example: "No",
    description: "Volunteering participation",
  },
  {
    name: "GPA",
    type: "number",
    required: false,
    validRange: "0.0 - 4.0",
    example: "3.5",
    description: "Current grade point average",
  },
  {
    name: "GradeClass",
    type: "number",
    required: false,
    validRange: "0 - 4 (0=A, 1=B, 2=C, 3=D, 4=F)",
    example: "1",
    description: "Actual grade class (for model training)",
  },
];

/**
 * Generates an example CSV row from the schema.
 */
function generateExampleRow(): string {
  const headers = STUDENT_SCHEMA.map((f) => f.name).join(",");
  const values = STUDENT_SCHEMA.map((f) => f.example).join(",");
  return `${headers}\n${values}`;
}

/**
 * Props for SchemaDisplay component.
 */
interface SchemaDisplayProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show in collapsed mode initially */
  defaultCollapsed?: boolean;
}

/**
 * Displays the accepted data schema in a user-friendly table.
 */
export function SchemaDisplay({
  className,
  defaultCollapsed = true,
}: SchemaDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  return (
    <div
      className={cn(
        "border border-[hsl(214.3,31.8%,91.4%)] rounded-lg overflow-hidden",
        className,
      )}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "bg-[hsl(210,40%,96.1%)]",
          "hover:bg-[hsl(214.3,31.8%,91.4%)]",
          "transition-colors text-left",
        )}
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-[hsl(222.2,47.4%,11.2%)]">
            Accepted Data Schema
          </span>
          <span className="text-xs text-[hsl(240,3.8%,46.1%)]">
            ({STUDENT_SCHEMA.filter((f) => f.required).length} required,{" "}
            {STUDENT_SCHEMA.filter((f) => !f.required).length} optional fields)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Schema Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(214.3,31.8%,91.4%)]">
                  <th className="text-left py-2 px-3 font-medium text-[hsl(240,3.8%,46.1%)]">
                    Column
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[hsl(240,3.8%,46.1%)]">
                    Type
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[hsl(240,3.8%,46.1%)]">
                    Required
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[hsl(240,3.8%,46.1%)]">
                    Valid Values
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-[hsl(240,3.8%,46.1%)]">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody>
                {STUDENT_SCHEMA.map((field) => (
                  <tr
                    key={field.name}
                    className="border-b border-[hsl(210,40%,96.1%)] hover:bg-[hsl(210,40%,96.1%)]"
                  >
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <code className="text-indigo-600 font-mono text-xs">
                          {field.name}
                        </code>
                        <span className="text-xs text-[hsl(240,3.8%,46.1%)] mt-0.5">
                          {field.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <code className="text-xs bg-[hsl(210,40%,96.1%)] px-1.5 py-0.5 rounded text-[hsl(240,3.8%,46.1%)]">
                        {field.type}
                      </code>
                    </td>
                    <td className="py-2 px-3">
                      {field.required ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Required
                        </span>
                      ) : (
                        <span className="text-xs text-[hsl(240,3.8%,46.1%)]">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <code className="text-xs text-[hsl(240,3.8%,46.1%)]">
                        {field.validRange}
                      </code>
                    </td>
                    <td className="py-2 px-3">
                      <code className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                        {field.example}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Example Row */}
          <div className="bg-[hsl(210,40%,96.1%)] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-[hsl(222.2,47.4%,11.2%)]">
                Example Valid Row
              </span>
            </div>
            <pre className="text-xs bg-white p-3 rounded overflow-x-auto font-mono text-[hsl(240,3.8%,46.1%)]">
              {generateExampleRow()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Validation error with column details.
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
 * Props for ValidationErrorDisplay component.
 */
interface ValidationErrorDisplayProps {
  /** List of validation errors */
  errors: ColumnValidationError[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays validation errors with column highlighting and example row.
 */
export function ValidationErrorDisplay({
  errors,
  className,
}: ValidationErrorDisplayProps) {
  if (errors.length === 0) return null;

  // Group errors by column
  const errorsByColumn = errors.reduce(
    (acc, error) => {
      if (!acc[error.column]) {
        acc[error.column] = [];
      }
      acc[error.column].push(error);
      return acc;
    },
    {} as Record<string, ColumnValidationError[]>,
  );

  const uniqueColumns = Object.keys(errorsByColumn);

  return (
    <div
      className={cn(
        "border border-red-200 rounded-lg overflow-hidden",
        "bg-red-50",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-red-200">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <span className="font-medium text-red-800">
          Validation Errors Found
        </span>
        <span className="text-sm text-red-600">
          ({errors.length} error{errors.length !== 1 ? "s" : ""} in{" "}
          {uniqueColumns.length} column{uniqueColumns.length !== 1 ? "s" : ""})
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Error List by Column */}
        <div className="space-y-3">
          {uniqueColumns.map((column) => {
            const columnErrors = errorsByColumn[column] ?? [];
            const schemaField = STUDENT_SCHEMA.find((f) => f.name === column);

            return (
              <div
                key={column}
                className="bg-white rounded-lg border border-red-200 p-3"
              >
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-semibold text-red-700 font-mono">
                        {column}
                      </code>
                      <span className="text-xs text-red-600">
                        ({columnErrors.length} error
                        {columnErrors.length !== 1 ? "s" : ""})
                      </span>
                    </div>

                    {/* Show first few errors for this column */}
                    <div className="mt-2 space-y-1">
                      {columnErrors.slice(0, 3).map((error, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-red-700"
                        >
                          <span className="text-red-500">Row {error.row}:</span>{" "}
                          Got{" "}
                          <code className="bg-red-100 px-1 rounded">
                            {error.invalidValue || "(empty)"}
                          </code>
                          , expected{" "}
                          <code className="bg-emerald-100 px-1 rounded text-emerald-700">
                            {error.expected}
                          </code>
                        </div>
                      ))}
                      {columnErrors.length > 3 && (
                        <div className="text-xs text-red-500">
                          ...and {columnErrors.length - 3} more errors
                        </div>
                      )}
                    </div>

                    {/* Show expected format from schema */}
                    {schemaField && (
                      <div className="mt-2 pt-2 border-t border-red-100">
                        <span className="text-xs text-[hsl(240,3.8%,46.1%)]">
                          Expected format:{" "}
                        </span>
                        <code className="text-xs text-[hsl(222.2,47.4%,11.2%)]">
                          {schemaField.validRange}
                        </code>
                        <span className="text-xs text-slate-500 mx-2">•</span>
                        <span className="text-xs text-[hsl(240,3.8%,46.1%)]">
                          Example:{" "}
                        </span>
                        <code className="text-xs bg-emerald-50 text-emerald-700 px-1 rounded">
                          {schemaField.example}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conforming Example Row */}
        <div className="bg-white rounded-lg border border-[hsl(214.3,31.8%,91.4%)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-[hsl(222.2,47.4%,11.2%)]">
              Example Row That Conforms to Schema
            </span>
          </div>
          <pre className="text-xs bg-[hsl(210,40%,96.1%)] p-3 rounded overflow-x-auto font-mono text-[hsl(240,3.8%,46.1%)]">
            {generateExampleRow()}
          </pre>
        </div>
      </div>
    </div>
  );
}

export { STUDENT_SCHEMA, type SchemaField };
