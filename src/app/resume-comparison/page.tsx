"use client";

import { ArrowLeft, FileDiff, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";
import { cn } from "@/lib/utils/cn";

interface ComparisonResult {
  winner: "A" | "B" | "tie";
  winnerReason: string;
  scoreA: number;
  scoreB: number;
  categories: {
    category: string;
    scoreA: number;
    scoreB: number;
    maxScore: number;
    winner: "A" | "B" | "tie";
  }[];
  strengthsA: string[];
  strengthsB: string[];
  recommendation: string;
}

export default function ResumeComparisonPage() {
  const [resumeA, setResumeA] = useState<File | null>(null);
  const [resumeB, setResumeB] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCompare = useCallback(async () => {
    if (!resumeA || !resumeB) return;
    setIsLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("resumeA", resumeA);
      formData.append("resumeB", resumeB);
      const response = await fetch("/api/resume-comparison", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        alert("Comparison failed. Please try again.");
      }
    } catch {
      alert("Failed to compare. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeA, resumeB]);

  const handleReset = () => {
    setResumeA(null);
    setResumeB(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      <NavHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1 pt-22 md:pt-24">
        {!result ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Resume Version Comparison
              </h1>
              <p className="text-gray-500 text-sm">
                Upload two resume versions to find which performs better
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <FileUploadZone
                  label="Resume Version A"
                  file={resumeA}
                  onFileChange={setResumeA}
                  hint="PDF file"
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <FileUploadZone
                  label="Resume Version B"
                  file={resumeB}
                  onFileChange={setResumeB}
                  hint="PDF file"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleCompare}
                disabled={isLoading || !resumeA || !resumeB}
                className={cn(
                  "px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Comparing...
                  </>
                ) : (
                  <>
                    <FileDiff className="w-5 h-5" /> Compare Versions
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Winner Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <Trophy
                className={cn(
                  "w-12 h-12 mx-auto mb-4",
                  result.winner === "tie"
                    ? "text-amber-500"
                    : "text-emerald-500",
                )}
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {result.winner === "tie"
                  ? "It's a Tie!"
                  : `Version ${result.winner} Wins!`}
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto mb-4">
                {result.winnerReason}
              </p>
              <div className="flex justify-center gap-8">
                <div
                  className={cn(
                    "text-center p-4 rounded-xl border-2",
                    result.winner === "A"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200",
                  )}
                >
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: result.winner === "A" ? "#16a34a" : "#6b7280",
                    }}
                  >
                    {result.scoreA}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Version A</p>
                </div>
                <div className="flex items-center text-gray-400 font-bold text-xl">
                  vs
                </div>
                <div
                  className={cn(
                    "text-center p-4 rounded-xl border-2",
                    result.winner === "B"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200",
                  )}
                >
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: result.winner === "B" ? "#16a34a" : "#6b7280",
                    }}
                  >
                    {result.scoreB}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Version B</p>
                </div>
              </div>
            </div>

            {/* Category Comparison */}
            {result.categories.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Category-by-Category
                </h3>
                <div className="space-y-4">
                  {result.categories.map((c) => (
                    <div key={c.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {c.category}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            c.winner === "A"
                              ? "bg-blue-100 text-blue-700"
                              : c.winner === "B"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {c.winner === "tie" ? "Tie" : `Version ${c.winner}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-gray-500">A</span>
                            <span className="text-xs font-medium">
                              {c.scoreA}/{c.maxScore}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(c.scoreA / c.maxScore) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-gray-500">B</span>
                            <span className="text-xs font-medium">
                              {c.scoreB}/{c.maxScore}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-pink-500 rounded-full"
                              style={{
                                width: `${(c.scoreB / c.maxScore) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">
                  Version A Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengthsA.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg text-sm text-gray-700 border border-blue-100"
                    >
                      <span className="text-blue-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-pink-600 mb-3">
                  Version B Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengthsB.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 p-2 bg-pink-50 rounded-lg text-sm text-gray-700 border border-pink-100"
                    >
                      <span className="text-pink-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#6e44ff] mb-3">
                🎯 Recommendation
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.recommendation}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Compare Again
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
