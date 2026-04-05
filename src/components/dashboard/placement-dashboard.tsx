"use client";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  ClipboardCheck,
  PenLine,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

interface PlacementDashboardProps {
  onBack?: () => void;
  initialProfile?: CandidateProfile | null;
  initialParseResult?: ResumeParseResult | null;
}

/**
 * Main Placement Prediction Dashboard.
 */
export function PlacementDashboard({
  onBack,
  initialProfile,
  initialParseResult,
}: PlacementDashboardProps) {
  const [view, setView] = useState<ViewState>("input");
  const [profile, setProfile] = useState<CandidateProfile>(
    initialProfile || createEmptyProfile(),
  );
  const [prediction, setPrediction] = useState<PlacementPrediction | null>(
    null,
  );
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);

  // Sync profile when initialProfile changes (after resume parsing)
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  /**
   * Handle form submission and run prediction.
   */
  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setShowSuccessBanner(false);

    try {
      // Check relevance of skills and certifications with Gemini
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

    // Run ML prediction on the server (avoids blocking the browser thread)
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

  /**
   * Reset to input view.
   */
  const handleReset = useCallback(() => {
    setView("input");
    setProfile(createEmptyProfile());
    setPrediction(null);
    setIssues([]);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Header - only show on input view */}
      {view === "input" && <NavHeader />}

      {/* Main Content */}
      <main
        className={cn(
          "max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1",
          view === "input" ? "pt-22 md:pt-24" : "pt-6",
        )}
      >
        {view === "input" ? (
          <div className="space-y-8">
            {/* Resume Parse Success Banner (when coming from landing page) */}
            {showSuccessBanner &&
              initialProfile &&
              initialParseResult?.success && (
                <div className="bg-[#6e44ff]/5 border border-[#6e44ff]/20 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6e44ff]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-[#6e44ff]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Resume parsed successfully
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Review the extracted information below and make any
                        corrections before proceeding.
                      </p>
                      {initialParseResult.missingFields &&
                        initialParseResult.missingFields.length > 0 && (
                          <p className="text-sm text-[#6e44ff] mt-2">
                            <span className="font-medium">
                              Please fill manually:
                            </span>{" "}
                            {initialParseResult.missingFields.join(", ")}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}

            {/* Role Selection */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6e44ff]/10 rounded-full border border-[#6e44ff]/20">
                <Briefcase className="w-4 h-4 text-[#6e44ff]" />
                <span className="text-sm font-medium text-[#6e44ff]">
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

      {/* Footer - only show on input view */}
      {view === "input" && <Footer showDisclaimer />}
    </div>
  );
}
