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
          <div className="space-y-12 sm:space-y-16">
            {/* Hero Section */}
            <section className="relative text-center max-w-4xl mx-auto px-4 sm:px-6 mt-4">
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
                <FileDiff className="w-3.5 h-3.5" />
                <span>AI-Powered A/B Testing</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
                Resume{" "}
                <span className="text-[#1360fa]">Version Comparison</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
                Not sure which resume is better? Upload two versions to find out
                which one effectively communicates your impact and has higher
                ATS compatibility.
              </p>
            </section>

            {/* Tool Area */}
            <section className="max-w-4xl mx-auto relative z-10 px-4 sm:px-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl shadow-gray-100/50">
                <div className="grid md:grid-cols-2 gap-6">
                  <FileUploadZone
                    label="Resume Version A"
                    file={resumeA}
                    onFileChange={setResumeA}
                    hint="PDF file up to 5MB"
                  />
                  <FileUploadZone
                    label="Resume Version B"
                    file={resumeB}
                    onFileChange={setResumeB}
                    hint="PDF file up to 5MB"
                  />
                </div>

                <div className="mt-8 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleCompare}
                    disabled={isLoading || !resumeA || !resumeB}
                    className={cn(
                      "w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
                      isLoading || !resumeA || !resumeB
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Comparing
                        Versions...
                      </>
                    ) : (
                      <>
                        <FileDiff className="w-5 h-5" /> Compare Versions
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Analysis happens locally for maximum privacy.
                  </p>
                </div>
              </div>
            </section>

            {/* How it Works Section */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-12">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  How It Works
                </h2>
                <p className="text-gray-500">
                  Discover how we evaluate versions against industry benchmarks.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Metrics Analysis
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We quantify both resumes on factors like action verb usage,
                    quantitative accomplishments, and readability.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Structural Check
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Our AI models assess which version has better ATS-friendly
                    formatting, evaluating section distribution.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Winning Verdict
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    A comprehensive side-by-side comparison yields a final
                    verdict on which resume will perform better in applications.
                  </p>
                </div>
              </div>
            </section>
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
              <h3 className="text-lg font-semibold text-[#1360fa] mb-3">
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
