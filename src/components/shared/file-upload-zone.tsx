"use client";

import { FileText, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface FileUploadZoneProps {
  label: string;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  isLoading?: boolean;
  hint?: string;
  allowText?: boolean;
  defaultMode?: "file" | "text";
  textValue?: string;
  onTextChange?: (value: string) => void;
  textPlaceholder?: string;
}

/**
 * Reusable file upload zone with drag-and-drop support.
 * Used across JD Matching, ATS Score, and Resume Comparison tools.
 */
export function FileUploadZone({
  label,
  accept = ".pdf,application/pdf",
  file,
  onFileChange,
  isLoading = false,
  hint = "PDF files accepted",
  allowText = false,
  defaultMode = "file",
  textValue = "",
  onTextChange,
  textPlaceholder = "Or paste text content here...",
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "text">(defaultMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        onFileChange(droppedFile);
      }
    },
    [onFileChange],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileChange(selectedFile);
      }
      e.target.value = "";
    },
    [onFileChange],
  );

  const handleRemoveFile = useCallback(() => {
    onFileChange(null);
  }, [onFileChange]);

  if (file) {
    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        <div className="flex items-center gap-3 p-4 bg-[#1360fa]/5 border border-[#1360fa]/20 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#1360fa]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#1360fa]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        {allowText && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setInputMode("file")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                inputMode === "file"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              File
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                inputMode === "text"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              Text
            </button>
          </div>
        )}
      </div>

      {allowText && inputMode === "text" ? (
        <textarea
          value={textValue}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder={textPlaceholder}
          rows={8}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 transition-colors resize-none"
        />
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={isLoading}
            className={cn(
              "w-full p-8 border-2 border-dashed rounded-xl transition-all duration-200 text-center cursor-pointer",
              isDragOver
                ? "border-[#1360fa] bg-[#1360fa]/5"
                : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#1360fa] animate-spin" />
                <p className="text-sm text-gray-500">Processing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#1360fa]/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#1360fa]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop file here or{" "}
                    <span className="text-[#1360fa]">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </div>
              </div>
            )}
          </button>
        </>
      )}
    </div>
  );
}
