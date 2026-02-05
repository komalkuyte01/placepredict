"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CandidateProfile, PlacementPrediction, ResumeParseResult } from "@/lib/types/placement";
import { createEmptyProfile, predictPlacement } from "@/lib/ml/placement-ml-engine";
import { parseResume } from "@/lib/parsers/resume-parser";
import { CandidateForm } from "@/components/forms/candidate-form";
import { PredictionResults } from "@/components/results/prediction-results";

type ViewState = "input" | "results";

/**
 * Main Placement Prediction Dashboard.
 * Clean black & white UI for student placement prediction.
 */
export function PlacementDashboard() {
  const [view, setView] = useState<ViewState>("input");
  const [profile, setProfile] = useState<CandidateProfile>(createEmptyProfile());
  const [prediction, setPrediction] = useState<PlacementPrediction | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeParseResult, setResumeParseResult] = useState<ResumeParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle resume file upload.
   */
  const handleResumeUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await parseResume(file);
      setResumeParseResult(result);
      
      if (result.success && result.extractedData) {
        // Merge extracted data with current profile
        setProfile((prev) => ({
          ...prev,
          academic: {
            ...prev.academic,
            ...result.extractedData.academic,
          },
          technical: {
            ...prev.technical,
            ...result.extractedData.technical,
          },
          experience: {
            ...prev.experience,
            ...result.extractedData.experience,
          },
        }));
        setResumeUploaded(true);
      }
    } catch (error) {
      console.error("Resume parsing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Handle form submission and run prediction.
   */
  const handleAnalyze = useCallback(() => {
    const result = predictPlacement(profile);
    setPrediction(result);
    setView("results");
  }, [profile]);

  /**
   * Reset to input view.
   */
  const handleReset = useCallback(() => {
    setView("input");
    setProfile(createEmptyProfile());
    setPrediction(null);
    setResumeUploaded(false);
    setResumeParseResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,100%)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[hsl(240,5.9%,90%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(240,5.9%,10%)] flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[hsl(240,10%,3.9%)]">
                  PlacePredict
                </h1>
                <p className="text-xs text-[hsl(240,3.8%,46.1%)]">
                  Placement Probability Predictor
                </p>
              </div>
            </div>

            {view === "results" && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-[hsl(240,5.9%,10%)] hover:bg-[hsl(240,4.8%,95.9%)] rounded-lg transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {view === "input" ? (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center py-6">
              <h2 className="text-3xl font-bold tracking-tight text-[hsl(240,10%,3.9%)]">
                Student Placement Predictor
              </h2>
              <p className="mt-2 text-[hsl(240,3.8%,46.1%)] max-w-xl mx-auto">
                Analyze your profile and get placement probability for Software Developer roles
              </p>
            </div>

            {/* Role Selection */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(240,4.8%,95.9%)] rounded-lg border border-[hsl(240,5.9%,90%)]">
                <Briefcase className="w-4 h-4 text-[hsl(240,5.9%,10%)]" />
                <span className="text-sm font-medium text-[hsl(240,5.9%,10%)]">Role: Software Developer</span>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="bg-white rounded-xl p-6 border border-[hsl(240,5.9%,90%)] shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
                <Upload className="w-5 h-5" />
                Upload Resume (Optional)
              </h3>
              <p className="text-sm text-[hsl(240,3.8%,46.1%)] mb-4">
                Upload your resume to auto-fill some fields. Supports .txt files.
              </p>
              
              <ResumeDropzone
                onFileUpload={handleResumeUpload}
                isProcessing={isProcessing}
                isUploaded={resumeUploaded}
              />

              {resumeParseResult && (
                <div className={cn(
                  "mt-4 p-4 rounded-lg",
                  resumeParseResult.success 
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-red-50 border border-red-200"
                )}>
                  <div className="flex items-start gap-2">
                    {resumeParseResult.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        resumeParseResult.success 
                          ? "text-emerald-800"
                          : "text-red-800"
                      )}>
                        {resumeParseResult.success 
                          ? `Resume parsed (${resumeParseResult.confidence}% confidence)`
                          : "Failed to parse resume"}
                      </p>
                      {resumeParseResult.missingFields.length > 0 && (
                        <p className="text-sm text-[hsl(240,3.8%,46.1%)] mt-1">
                          Please fill manually: {resumeParseResult.missingFields.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Form */}
            <CandidateForm
              profile={profile}
              onProfileChange={setProfile}
              onSubmit={handleAnalyze}
            />
          </div>
        ) : (
          prediction && (
            <PredictionResults
              prediction={prediction}
              profile={profile}
              onReset={handleReset}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(240,5.9%,90%)] mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-[hsl(240,3.8%,46.1%)]">
              PlacePredict — Student Placement Probability Predictor
            </p>
            <p className="text-xs text-[hsl(240,3.8%,60%)]">
              ⚠️ Disclaimer: This is a probabilistic model for guidance only. Results may vary based on actual recruitment processes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Resume drag-and-drop upload zone.
 */
interface ResumeDropzoneProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  isUploaded: boolean;
}

function ResumeDropzone({ onFileUpload, isProcessing, isUploaded }: ResumeDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center",
        "w-full h-32 p-4",
        "border-2 border-dashed rounded-lg",
        "transition-all cursor-pointer",
        isDragging
          ? "border-[hsl(240,5.9%,10%)] bg-[hsl(240,4.8%,95.9%)]"
          : "border-[hsl(240,5.9%,90%)] hover:border-[hsl(240,5.9%,70%)] hover:bg-[hsl(240,4.8%,95.9%)]",
        isUploaded && "border-emerald-500 bg-emerald-50"
      )}
    >
      <input
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      {isProcessing ? (
        <div className="w-8 h-8 border-2 border-[hsl(240,5.9%,10%)] border-t-transparent rounded-full animate-spin" />
      ) : isUploaded ? (
        <>
          <CheckCircle className="w-8 h-8 text-emerald-600" />
          <span className="mt-2 text-sm text-emerald-700 font-medium">Resume uploaded</span>
        </>
      ) : (
        <>
          <FileText className="w-8 h-8 text-[hsl(240,3.8%,46.1%)]" />
          <span className="mt-2 text-sm text-[hsl(240,3.8%,46.1%)]">
            Drop resume here or click to browse
          </span>
        </>
      )}
    </div>
  );
}
