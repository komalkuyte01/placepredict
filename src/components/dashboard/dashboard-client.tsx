"use client";

import { useState } from "react";
import { GraduationCap, BookOpen, BarChart3, Github } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FileDropzone, UploadStatus } from "@/components/upload/file-dropzone";
import {
  SchemaDisplay,
  ValidationErrorDisplay,
} from "@/components/upload/schema-display";
import type { ColumnValidationError } from "@/lib/actions/student-actions";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/elements";
import {
  processStudentFile,
  type ProcessFileResponse,
} from "@/lib/actions/student-actions";
import type {
  DatasetStatistics,
  ParseResult,
  PredictionResult,
  StudentRecord,
} from "@/lib/types/student";

/**
 * State for processed data.
 */
interface ProcessedData {
  parseResult: ParseResult;
  predictions: PredictionResult[];
  statistics: DatasetStatistics;
}

/**
 * Main dashboard client component.
 * Handles file upload state and renders analytics.
 */
export function DashboardClient() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    recordCount?: number;
    errorCount?: number;
  } | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(
    null,
  );
  const [columnErrors, setColumnErrors] = useState<ColumnValidationError[]>([]);

  /**
   * Handles the response from file processing.
   */
  const handleFileProcessed = (response: ProcessFileResponse) => {
    if (response.success && response.data) {
      setProcessedData(response.data);
      setColumnErrors([]);
      setUploadStatus({
        success: true,
        message: `Successfully analyzed ${response.data.parseResult.successfulRows} student records`,
        recordCount: response.data.parseResult.successfulRows,
        errorCount: response.data.parseResult.errors.length,
      });
    } else {
      setUploadStatus({
        success: false,
        message: response.error ?? "An unknown error occurred",
      });
      setColumnErrors(response.columnErrors ?? []);
      setProcessedData(null);
    }
  };

  /**
   * Resets the dashboard to upload a new file.
   */
  const handleReset = () => {
    setProcessedData(null);
    setUploadStatus(null);
    setColumnErrors([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  GradeSight
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Student Performance Prediction
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {processedData && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Upload New File
                </Button>
              )}
              <a
                href="https://github.com/anuj-kuralkar/gradesight"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-lg",
                  "text-slate-500 hover:text-slate-700",
                  "dark:text-slate-400 dark:hover:text-slate-200",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  "transition-colors",
                )}
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!processedData ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Predict Student Performance
              </h2>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                Upload your student data to get AI-powered predictions and
                insights
              </p>
            </div>

            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Upload Student Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schema Display - shows expected data format */}
                <SchemaDisplay />

                <FileDropzone
                  onFileProcessed={handleFileProcessed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  processFile={processStudentFile}
                />

                {uploadStatus && (
                  <UploadStatus
                    success={uploadStatus.success}
                    message={uploadStatus.message}
                    recordCount={uploadStatus.recordCount}
                    errorCount={uploadStatus.errorCount}
                  />
                )}

                {/* Validation Error Display - shows column-level errors */}
                {columnErrors.length > 0 && (
                  <ValidationErrorDisplay errors={columnErrors} />
                )}
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <FeatureCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Data Analysis"
                description="Comprehensive statistical analysis of student performance metrics"
              />
              <FeatureCard
                icon={<GraduationCap className="w-5 h-5" />}
                title="Grade Prediction"
                description="ML-powered predictions based on study habits and engagement"
              />
              <FeatureCard
                icon={<BookOpen className="w-5 h-5" />}
                title="Risk Assessment"
                description="Identify at-risk students and key intervention factors"
              />
            </div>

            {/* Dataset Info */}
            <Card className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="py-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Supported Format:</span> Upload
                  CSV or Excel files following the{" "}
                  <a
                    href="https://www.kaggle.com/datasets/prajwalkanade/student-performance-prediction-dataset"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Student Performance Prediction Dataset
                  </a>{" "}
                  schema.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Analytics Dashboard */
          <AnalyticsDashboard
            statistics={processedData.statistics}
            predictions={processedData.predictions}
            students={processedData.parseResult.records}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            GradeSight — Data Science College Project ©{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Props for the FeatureCard component.
 */
interface FeatureCardProps {
  /** Feature icon */
  icon: React.ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
}

/**
 * Feature highlight card for the landing section.
 */
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl",
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="mt-3 font-medium text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
