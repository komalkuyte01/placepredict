"use client";

import { ArrowLeft, Briefcase, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CandidateForm } from "@/components/prediction/candidate-form";
import { PredictionResults } from "@/components/prediction/prediction-results";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";
import type {
  CandidateProfile,
  IssueItem,
  PlacementPrediction,
  ResumeParseResult,
} from "@/lib/types/placement";

type ViewState = "input" | "results";
type EntryMode = "upload" | "manual";

export default function PredictionPage() {
  const [view, setView] = useState<ViewState>("input");
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [prediction, setPrediction] = useState<PlacementPrediction | null>(
    null,
  );
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ResumeParseResult | null>(
    null,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read the passed-in state from the dashboard modal
    const stored = sessionStorage.getItem("predictionInitialState");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setEntryMode(data.mode);
        setProfile(data.profile);
        setParseResult(data.parseResult);
      } catch (e) {
        console.error("Failed to parse predictionInitialState", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!profile) return;
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
    // Completely wipe and return to dashboard
    sessionStorage.removeItem("predictionInitialState");
    window.location.href = "/";
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col overflow-x-hidden">
      <NavHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1 pt-20 md:pt-22">
        {!profile ? (
          (() => {
            window.location.href = "/#tools";
            return null;
          })()
        ) : (
          <div className="space-y-8">
            <div className="mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-600 text-sm border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </div>

            {view === "input" ? (
              <div className="max-w-4xl mx-auto space-y-8">
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

                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1360fa]/10 rounded-full border border-[#1360fa]/20">
                    <Briefcase className="w-4 h-4 text-[#1360fa]" />
                    <span className="text-sm font-medium text-[#1360fa]">
                      Role: Software Developer
                    </span>
                  </div>
                </div>

                <CandidateForm
                  profile={profile}
                  onProfileChange={setProfile}
                  onSubmit={handleAnalyze}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              prediction &&
              profile && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <PredictionResults
                    prediction={prediction}
                    profile={profile}
                    onReset={handleReset}
                    issues={issues}
                  />
                </div>
              )
            )}
          </div>
        )}
      </main>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 flex justify-center">
        <div className="w-fit p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-700 text-xs leading-relaxed text-left">
            ⚠️ <strong className="font-medium">Disclaimer:</strong> The
            predictions provided are for guidance only. They do not guarantee
            any outcomes.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
