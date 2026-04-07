"use client";

import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";

interface ProjectResult {
  score: number;
  complexityRating: string;
  relevanceRating: string;
  skillsCovered: string[];
  strengths: string[];
  suggestions: string[];
  recruiterTips: string[];
  _projectName?: string;
}

export default function ProjectAssessmentPage() {
  const [result, setResult] = useState<ProjectResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("projectSettings");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse Project Assessment result", e);
      }
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col overflow-x-hidden">
      <NavHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1 pt-20 md:pt-22">
        {!result ? (
          (() => {
            window.location.href = "/#tools";
            return null;
          })()
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-600 text-sm border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </div>
            {/* Score */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    role="img"
                    aria-label="Project score chart"
                  >
                    <title>Project Score</title>
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f3f4f6"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={
                        result.score >= 7
                          ? "#16a34a"
                          : result.score >= 5
                            ? "#ca8a04"
                            : "#dc2626"
                      }
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${result.score * 44} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-4xl font-bold"
                      style={{
                        color:
                          result.score >= 7
                            ? "#16a34a"
                            : result.score >= 5
                              ? "#ca8a04"
                              : "#dc2626",
                      }}
                    >
                      {result.score}
                    </span>
                    <span className="text-xs text-gray-500">out of 10</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {result._projectName || "Project"} Assessment
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200">
                      Complexity: {result.complexityRating}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                      Relevance: {result.relevanceRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Covered */}
            {result.skillsCovered.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                  🎯 Skills Covered by This Project
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skillsCovered.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                  💪 Project Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm text-gray-700"
                    >
                      <span className="text-emerald-500 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#1360fa] mb-3">
                  💡 Suggestions to Improve
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 p-3 bg-[#1360fa]/5 rounded-lg border border-[#1360fa]/10 text-sm text-gray-700"
                    >
                      <span className="text-[#1360fa] mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recruiter Tips */}
            {result.recruiterTips.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" /> How to Impress Recruiters
                </h3>
                <ul className="space-y-2">
                  {result.recruiterTips.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-gray-700"
                    >
                      <span className="text-amber-500 mt-0.5">⭐</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-14 pb-4">
        <div className="w-fit mx-auto p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-700 text-xs leading-relaxed text-left">
            ⚠️ <strong className="font-medium">Disclaimer:</strong> The results
            provided are for guidance only. They do not guarantee any outcomes.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
