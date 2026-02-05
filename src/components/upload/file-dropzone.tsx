"use client";

import { FileUpload } from "@ark-ui/react/file-upload";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProcessFileResponse } from "@/lib/actions/student-actions";

/**
 * Props for the FileDropzone component.
 */
interface FileDropzoneProps {
  /** Callback when file processing completes */
  onFileProcessed: (response: ProcessFileResponse) => void;
  /** Whether file is currently being processed */
  isProcessing: boolean;
  /** Sets processing state */
  setIsProcessing: (processing: boolean) => void;
  /** Server action to process the file */
  processFile: (formData: FormData) => Promise<ProcessFileResponse>;
}

/**
 * Drag-and-drop file upload zone for CSV/Excel files.
 * Uses Ark UI's FileUpload component for accessibility.
 */
export function FileDropzone({
  onFileProcessed,
  isProcessing,
  setIsProcessing,
  processFile,
}: FileDropzoneProps) {
  /**
   * Handles file selection and processing.
   */
  const handleFileAccept = async (details: { files: File[] }) => {
    const file = details.files[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await processFile(formData);
      onFileProcessed(response);
    } catch (error) {
      onFileProcessed({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process file",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FileUpload.Root
      maxFiles={1}
      accept={{
        "text/csv": [".csv"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "application/vnd.ms-excel": [".xls"],
      }}
      onFileAccept={handleFileAccept}
      disabled={isProcessing}
    >
      <FileUpload.Dropzone
        className={cn(
          "relative flex flex-col items-center justify-center gap-4",
          "w-full min-h-[200px] p-8",
          "border-2 border-dashed rounded-xl",
          "transition-all duration-200 ease-in-out",
          "border-[hsl(214.3,31.8%,91.4%)]",
          "hover:border-indigo-400",
          "hover:bg-[hsl(210,40%,98%)]",
          "data-[dragging]:border-indigo-500 data-[dragging]:bg-indigo-50/50",
          isProcessing && "opacity-60 cursor-not-allowed",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full",
            "bg-[hsl(210,40%,96.1%)]",
            "transition-colors duration-200",
          )}
        >
          {isProcessing ? (
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-[hsl(240,3.8%,46.1%)]" />
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-medium text-[hsl(222.2,47.4%,11.2%)]">
            {isProcessing ? "Processing file..." : "Drop your file here"}
          </p>
          <p className="mt-1 text-sm text-[hsl(240,3.8%,46.1%)]">
            or click to browse
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[hsl(240,3.8%,46.1%)]">
          <FileSpreadsheet className="w-4 h-4" />
          <span>CSV, XLSX, or XLS (max 10MB)</span>
        </div>

        <FileUpload.Trigger
          className={cn(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
            isProcessing && "cursor-not-allowed",
          )}
        />
      </FileUpload.Dropzone>

      <FileUpload.HiddenInput />
    </FileUpload.Root>
  );
}

/**
 * Props for upload status indicator.
 */
interface UploadStatusProps {
  /** Whether upload was successful */
  success: boolean;
  /** Message to display */
  message: string;
  /** Number of records processed */
  recordCount?: number;
  /** Number of errors encountered */
  errorCount?: number;
}

/**
 * Displays the status of a file upload operation.
 */
export function UploadStatus({
  success,
  message,
  recordCount,
  errorCount,
}: UploadStatusProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg",
        success
          ? "bg-emerald-50 border border-emerald-200"
          : "bg-red-50 border border-red-200",
      )}
    >
      {success ? (
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium",
            success
              ? "text-emerald-800"
              : "text-red-800",
          )}
        >
          {success ? "File processed successfully" : "Processing failed"}
        </p>
        <p
          className={cn(
            "mt-1 text-sm",
            success
              ? "text-emerald-700"
              : "text-red-700",
          )}
        >
          {message}
        </p>

        {success && recordCount !== undefined && (
          <div className="mt-2 flex items-center gap-4 text-sm text-emerald-600">
            <span>{recordCount} records loaded</span>
            {errorCount !== undefined && errorCount > 0 && (
              <span className="text-amber-600">
                {errorCount} warnings
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
