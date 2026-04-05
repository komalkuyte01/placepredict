"use client";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  PenLine,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { CandidateForm } from "@/components/prediction/candidate-form";
import { PredictionResults } from "@/components/prediction/prediction-results";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";
import { createEmptyProfile } from "@/lib/ml/default-profile";
import type {
  CandidateProfile,
  IssueItem,
  PlacementPrediction,
  ResumeParseResult,
} from "@/lib/types/placement";
import { cn } from "@/lib/utils/cn";

type ViewState = "input" | "results";
type EntryMode = "upload" | "manual";

/**
 * Full prediction page — handles both resume upload + manual entry flows.
 */
export default function PredictionPage() {
  const [view, setView] = useState<ViewState>("input");
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null);
  const [profile, setProfile] = useState<CandidateProfile>(
    createEmptyProfile(),
  );
  const [prediction, setPrediction] = useState<PlacementPrediction | null>(
    null,
  );
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState<ResumeParseResult | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle resume upload
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          alert(
            `Resume parsing failed (HTTP ${response.status}):\n${errorText}`,
          );
          return;
        }

        const result: ResumeParseResult = await response.json();

        if (result.success && result.extractedData) {
          const baseProfile = createEmptyProfile();
          const newProfile: CandidateProfile = { ...baseProfile };

          if (result.extractedData.academic) {
            const academic = result.extractedData.academic;
            newProfile.academic = {
              ...baseProfile.academic,
              ...(academic.cgpa && academic.cgpa > 0
                ? { cgpa: academic.cgpa }
                : {}),
              ...(academic.tenthPercentage && academic.tenthPercentage > 0
                ? { tenthPercentage: academic.tenthPercentage }
                : {}),
              ...(academic.twelfthPercentage && academic.twelfthPercentage > 0
                ? { twelfthPercentage: academic.twelfthPercentage }
                : {}),
              ...(academic.degreeBranch
                ? { degreeBranch: academic.degreeBranch }
                : {}),
              ...(academic.backlogs !== undefined
                ? { backlogs: academic.backlogs }
                : {}),
            };
          }

          if (result.extractedData.technical) {
            const tech = result.extractedData.technical;
            newProfile.technical = {
              ...baseProfile.technical,
              technicalSkills:
                tech.technicalSkills?.length > 0
                  ? tech.technicalSkills
                  : baseProfile.technical.technicalSkills,
              dsaLevel:
                tech.dsaLevel && tech.dsaLevel !== "None"
                  ? tech.dsaLevel
                  : baseProfile.technical.dsaLevel,
              projectsCount:
                (tech.projectsCount ?? 0) > 0
                  ? tech.projectsCount
                  : baseProfile.technical.projectsCount,
              hasInternship:
                tech.hasInternship || baseProfile.technical.hasInternship,
              certifications:
                tech.certifications?.length > 0
                  ? tech.certifications
                  : baseProfile.technical.certifications,
            };
          }

          if (result.extractedData.experience) {
            const exp = result.extractedData.experience;
            newProfile.experience = {
              ...baseProfile.experience,
              hackathonsCount:
                (exp.hackathonsCount ?? 0) > 0
                  ? exp.hackathonsCount
                  : baseProfile.experience.hackathonsCount,
              hasOpenSourceContributions:
                exp.hasOpenSourceContributions ||
                baseProfile.experience.hasOpenSourceContributions,
              resumeATSScore:
                exp.resumeATSScore > 0
                  ? exp.resumeATSScore
                  : baseProfile.experience.resumeATSScore,
            };
          }

          setProfile(newProfile);
          setParseResult(result);
          setEntryMode("upload");
        } else {
          const warnings = result.warnings?.join("\n") || "";
          const missing = result.missingFields?.join(", ") || "";
          alert(
            `Resume parsing failed.\n\n${warnings ? `Reason: ${warnings}\n` : ""}${missing ? `Missing: ${missing}` : ""}`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        alert(`Resume parsing error:\n${message}`);
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);

    try {
      const relevanceResponse = await fetch("/api/check-relevance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: profile.technical.technicalSkills,
          certifications: profile.technical.certifications,
        }),
      });
      const relevanceData = await relevanceResponse.json();
      setIssues(relevanceData.issues || []);
    } catch (error) {
      console.error("Error checking relevance:", error);
      setIssues([]);
    }

    try {
      const predictionResponse = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const predictionData = await predictionResponse.json();

      if (!predictionResponse.ok) {
        alert(`Prediction failed: ${predictionData.error || "Unknown error"}`);
        setIsLoading(false);
        return;
      }

      setPrediction(predictionData.prediction);
    } catch (error) {
      console.error("Prediction request failed:", error);
      alert("Failed to run prediction. Please try again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setView("results");
  }, [profile]);

  const handleReset = useCallback(() => {
    setView("input");
    setProfile(createEmptyProfile());
    setPrediction(null);
    setIssues([]);
    setEntryMode(null);
    setParseResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-16 h-16 rounded-full bg-[#1360fa]/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#1360fa] animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Parsing Resume
              </h3>
              <p className="text-sm text-gray-500">
                AI is extracting your details...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <NavHeader />

      {/* Main Content */}
      <main
        className={cn(
          "max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1",
          view === "input" ? "pt-22 md:pt-24" : "pt-6",
        )}
      >
        {view === "input" ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="relative text-center max-w-4xl mx-auto px-4 sm:px-6 mt-4 mb-4">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1360fa]/10 rounded-full blur-[80px] -z-10" />
              <div className="mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-600 text-sm border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1360fa]/10 text-[#1360fa] text-xs font-medium mb-6 border border-[#1360fa]/20">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>AI-Powered Readiness</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
                Predict Your{" "}
                <span className="text-[#1360fa]">Placement Success</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Receive an instant, machine-learning-driven probability of
                securing a job offer alongside a detailed SHAP value breakdown
                of your profile.
              </p>
            </section>

            {/* Entry mode selection if no mode chosen yet */}
            {!entryMode && (
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-[#1360fa]/30 hover:shadow-lg hover:shadow-[#1360fa]/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1360fa] flex items-center justify-center mb-4 shadow-lg shadow-[#1360fa]/20">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Upload Resume
                  </h3>
                  <p className="text-sm text-gray-500">
                    AI extracts your details automatically
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode("manual")}
                  className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4 shadow-lg shadow-gray-900/20">
                    <PenLine className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Enter Manually
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fill in your details manually
                  </p>
                </button>
              </div>
            )}

            {/* Show form when entry mode is selected */}
            {entryMode && (
              <>
                {/* Parse success banner */}
                {entryMode === "upload" && parseResult?.success && (
                  <div className="bg-[#1360fa]/5 border border-[#1360fa]/20 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1360fa]/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-[#1360fa]" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Resume parsed successfully
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Review the extracted information below and make any
                          corrections before proceeding.
                        </p>
                        {parseResult.missingFields &&
                          parseResult.missingFields.length > 0 && (
                            <p className="text-sm text-[#1360fa] mt-2">
                              <span className="font-medium">
                                Please fill manually:
                              </span>{" "}
                              {parseResult.missingFields.join(", ")}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Role indicator */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1360fa]/10 rounded-full border border-[#1360fa]/20">
                    <Briefcase className="w-4 h-4 text-[#1360fa]" />
                    <span className="text-sm font-medium text-[#1360fa]">
                      Role: Software Developer
                    </span>
                  </div>
                </div>

                {/* Candidate Form */}
                <CandidateForm
                  profile={profile}
                  onProfileChange={setProfile}
                  onSubmit={handleAnalyze}
                  isLoading={isLoading}
                />
              </>
            )}

            {/* How it Works Section */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-12 mt-12">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  How It Works
                </h2>
                <p className="text-gray-500">
                  Discover the logic behind our machine learning predictions.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Data Extraction
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    AI accurately extracts 17+ core metrics from your uploaded
                    resume or manual entries including GPA, skills, and
                    projects.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Model Prediction
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Our model compares your profile against thousands of
                    successful historical candidate profiles to calculate a base
                    probability score.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Feature Impact
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    You receive a SHAP-like breakdown showing exactly which
                    metrics are pulling your chances up and what is dragging
                    them down.
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          prediction && (
            <PredictionResults
              prediction={prediction}
              profile={profile}
              onReset={handleReset}
              issues={issues}
            />
          )
        )}
      </main>

      {view === "input" && <Footer showDisclaimer />}
    </div>
  );
}
