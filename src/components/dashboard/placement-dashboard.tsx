"use client";

import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
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
  initialProfile?: CandidateProfile | null;
  initialParseResult?: ResumeParseResult | null;
}

/**
 * Main Placement Prediction Dashboard.
 */
export function PlacementDashboard({ 
  initialMode = "upload", 
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
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 -ml-2 mr-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Back to home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#6e44ff] flex items-center justify-center shadow-lg shadow-[#6e44ff]/20">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                  PlacePredict
                </h1>
                <p className="text-xs text-gray-500">
                  {initialProfile ? "Verify Your Details" : initialMode === "upload" ? "Resume Analysis Mode" : "Manual Entry Mode"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {view === "results" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pt-22 pb-10">
        {view === "input" ? (
          <div className="space-y-8">
            {/* Resume Parse Success Banner (when coming from landing page) */}
            {initialProfile && initialParseResult?.success && (
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
                      Review the extracted information below and make any corrections before proceeding.
                    </p>
                    {initialParseResult.missingFields && initialParseResult.missingFields.length > 0 && (
                      <p className="text-sm text-[#6e44ff] mt-2">
                        <span className="font-medium">Please fill manually:</span>{" "}
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
