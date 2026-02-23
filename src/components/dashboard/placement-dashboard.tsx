"use client";

import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  FileText,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CandidateForm } from "@/components/forms/candidate-form";
import { PredictionResults } from "@/components/results/prediction-results";
import {
  createEmptyProfile,
  predictPlacement,
} from "@/lib/ml/placement-ml-engine";
import type {
  CandidateProfile,
  PlacementPrediction,
  ResumeParseResult,
} from "@/lib/types/placement";
import { cn } from "@/lib/utils/cn";

type ViewState = "input" | "results";

interface PlacementDashboardProps {
  initialMode?: "upload" | "manual";
  onBack?: () => void;
}

/**
 * Main Placement Prediction Dashboard.
 * Clean black & white UI for student placement prediction.
 */
export function PlacementDashboard({ initialMode = "upload", onBack }: PlacementDashboardProps) {
  const [view, setView] = useState<ViewState>("input");
  const [profile, setProfile] = useState<CandidateProfile>(
    createEmptyProfile(),
  );
  const [prediction, setPrediction] = useState<PlacementPrediction | null>(
    null,
  );
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeParseResult, setResumeParseResult] =
    useState<ResumeParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResumeSection, setShowResumeSection] = useState(initialMode === "upload");

  // Update showResumeSection when initialMode changes
  useEffect(() => {
    setShowResumeSection(initialMode === "upload");
  }, [initialMode]);

  /**
   * Handle resume file upload.
   */
  const handleResumeUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      // Create FormData for API call
      const formData = new FormData();
      formData.append("file", file);

      // Call API route to parse PDF
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const result: ResumeParseResult = await response.json();
      setResumeParseResult(result);

      if (result.success && result.extractedData) {
        // Merge extracted data with current profile - only update fields that have values
        setProfile((prev) => {
          const newProfile = { ...prev };

          // Merge academic data (only non-zero/non-empty values)
          if (result.extractedData.academic) {
            const academic = result.extractedData.academic;
            newProfile.academic = {
              ...prev.academic,
              ...(academic.cgpa && academic.cgpa > 0
                ? { cgpa: academic.cgpa }
                : {}),
              ...(academic.tenthPercentage && academic.tenthPercentage > 0
                ? { tenthPercentage: academic.tenthPercentage }
                : {}),
              ...(academic.twelfthPercentage && academic.twelfthPercentage > 0
                ? { twelfthPercentage: academic.twelfthPercentage }
                : {}),
              ...(academic.degreeBranch && academic.degreeBranch !== "Other"
                ? { degreeBranch: academic.degreeBranch }
                : {}),
            };
          }

          // Merge technical data
          if (result.extractedData.technical) {
            const tech = result.extractedData.technical;
            newProfile.technical = {
              ...prev.technical,
              technicalSkills:
                tech.technicalSkills?.length > 0
                  ? [
                      ...new Set([
                        ...prev.technical.technicalSkills,
                        ...tech.technicalSkills,
                      ]),
                    ]
                  : prev.technical.technicalSkills,
              dsaLevel:
                tech.dsaLevel && tech.dsaLevel !== "None"
                  ? tech.dsaLevel
                  : prev.technical.dsaLevel,
              projectsCount:
                tech.projectsCount > 0
                  ? tech.projectsCount
                  : prev.technical.projectsCount,
              hasInternship: tech.hasInternship || prev.technical.hasInternship,
              certifications:
                tech.certifications?.length > 0
                  ? [
                      ...new Set([
                        ...prev.technical.certifications,
                        ...tech.certifications,
                      ]),
                    ]
                  : prev.technical.certifications,
            };
          }

          // Merge experience data
          if (result.extractedData.experience) {
            const exp = result.extractedData.experience;
            newProfile.experience = {
              ...prev.experience,
              hackathonsCount:
                exp.hackathonsCount > 0
                  ? exp.hackathonsCount
                  : prev.experience.hackathonsCount,
              hasOpenSourceContributions:
                exp.hasOpenSourceContributions ||
                prev.experience.hasOpenSourceContributions,
              resumeATSScore:
                exp.resumeATSScore > 0
                  ? exp.resumeATSScore
                  : prev.experience.resumeATSScore,
            };
          }

          return newProfile;
        });
        setResumeUploaded(true);
      }
    } catch (error) {
      console.error("Resume parsing failed:", error);
      setResumeParseResult({
        success: false,
        extractedData: {},
        confidence: 0,
        missingFields: [],
        warnings: ["Failed to parse resume. Please try again."],
      });
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
    setShowResumeSection(initialMode === "upload");
  }, [initialMode]);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,100%)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[hsl(240,5.9%,90%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 -ml-2 mr-1 text-[hsl(240,3.8%,46.1%)] hover:text-[hsl(240,10%,3.9%)] hover:bg-[hsl(240,4.8%,95.9%)] rounded-lg transition-colors"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[hsl(240,10%,3.9%)]">
                  PlacePredict
                </h1>
                <p className="text-xs text-[hsl(240,3.8%,46.1%)]">
                  {initialMode === "upload" ? "Resume Analysis Mode" : "Manual Entry Mode"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {view === "input" && (
                <button
                  type="button"
                  onClick={() => setShowResumeSection(!showResumeSection)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                    showResumeSection 
                      ? "bg-indigo-100 text-indigo-700" 
                      : "text-[hsl(240,3.8%,46.1%)] hover:bg-[hsl(240,4.8%,95.9%)]"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Resume
                </button>
              )}
              {view === "results" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-[hsl(240,5.9%,10%)] hover:bg-[hsl(240,4.8%,95.9%)] rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
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
                Analyze your profile and get placement probability for Software
                Developer roles
              </p>
            </div>

            {/* Role Selection */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(240,4.8%,95.9%)] rounded-lg border border-[hsl(240,5.9%,90%)]">
                <Briefcase className="w-4 h-4 text-[hsl(240,5.9%,10%)]" />
                <span className="text-sm font-medium text-[hsl(240,5.9%,10%)]">
                  Role: Software Developer
                </span>
              </div>
            </div>

            {/* Resume Upload Section */}
            {showResumeSection && (
              <div className="bg-white rounded-xl p-6 border border-[hsl(240,5.9%,90%)] shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
                  <Upload className="w-5 h-5" />
                  Upload Resume
                </h3>
                <p className="text-sm text-[hsl(240,3.8%,46.1%)] mb-4">
                  Upload your resume (PDF) and let AI extract your details automatically.
                </p>

                <ResumeDropzone
                  onFileUpload={handleResumeUpload}
                  isProcessing={isProcessing}
                  isUploaded={resumeUploaded}
                />

                {resumeParseResult && (
                  <div
                    className={cn(
                      "mt-4 p-4 rounded-lg",
                      resumeParseResult.success
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-red-50 border border-red-200",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {resumeParseResult.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            resumeParseResult.success
                              ? "text-emerald-800"
                              : "text-red-800",
                          )}
                        >
                          {resumeParseResult.success
                            ? `Resume parsed (${resumeParseResult.confidence}% confidence)`
                            : "Failed to parse resume"}
                        </p>
                        {resumeParseResult.missingFields.length > 0 && (
                          <p className="text-sm text-[hsl(240,3.8%,46.1%)] mt-1">
                            Please fill manually:{" "}
                            {resumeParseResult.missingFields.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
              ⚠️ Disclaimer: This is a probabilistic model for guidance only.
              Results may vary based on actual recruitment processes.
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

function ResumeDropzone({
  onFileUpload,
  isProcessing,
  isUploaded,
}: ResumeDropzoneProps) {
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
    // biome-ignore lint/a11y/useSemanticElements: This is a dropzone wrapper, actual interaction handled by hidden input
    <div
      role="button"
      tabIndex={0}
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
        isUploaded && "border-emerald-500 bg-emerald-50",
      )}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div className="w-8 h-8 border-2 border-[hsl(240,5.9%,10%)] border-t-transparent rounded-full animate-spin" />
      ) : isUploaded ? (
        <>
          <CheckCircle className="w-8 h-8 text-emerald-600" />
          <span className="mt-2 text-sm text-emerald-700 font-medium">
            Resume uploaded
          </span>
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
