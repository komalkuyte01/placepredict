"use client";

import {
  ArrowLeft,
  FileCheck,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { Footer } from "@/components/shared/footer";
import { cn } from "@/lib/utils/cn";

interface ATSResult {
  score: number;
  improving: { factor: string; detail: string }[];
  lowering: { factor: string; detail: string }[];
  suggestions: string[];
  breakdown: { category: string; score: number; maxScore: number }[];
}

export default function ATSScorePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!resumeFile) return;
    setIsLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const response = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        alert("Analysis failed. Please try again.");
      }
    } catch {
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeFile]);

  const handleReset = () => {
    setResumeFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="p-2 -ml-2 mr-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                ATS Score Analyzer
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1 pt-22 md:pt-24">
        {!result ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                ATS Score Analyzer
              </h1>
              <p className="text-gray-500 text-sm">
                Upload your resume to get its ATS compatibility score
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <FileUploadZone
                label="Your Resume"
                file={resumeFile}
                onFileChange={setResumeFile}
                hint="PDF file"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || !resumeFile}
                className={cn(
                  "px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5" /> Analyze ATS Score
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    role="img"
                    aria-label="ATS score chart"
                  >
                    <title>ATS Score</title>
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
                        result.score >= 70
                          ? "#16a34a"
                          : result.score >= 50
                            ? "#ca8a04"
                            : "#dc2626"
                      }
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${result.score * 4.4} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-4xl font-bold"
                      style={{
                        color:
                          result.score >= 70
                            ? "#16a34a"
                            : result.score >= 50
                              ? "#ca8a04"
                              : "#dc2626",
                      }}
                    >
                      {result.score}
                    </span>
                    <span className="text-xs text-gray-500">ATS Score</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ATS Analysis Results
                  </h2>
                  <p className="text-gray-500">
                    {result.score >= 75
                      ? "Your resume is well-optimized for ATS!"
                      : result.score >= 50
                        ? "Your resume has moderate ATS compatibility."
                        : "Your resume needs significant ATS improvements."}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            {result.breakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Section Breakdown
                </h3>
                <div className="space-y-3">
                  {result.breakdown.map((b) => (
                    <div key={b.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {b.category}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {b.score}/{b.maxScore}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            b.score / b.maxScore >= 0.7
                              ? "bg-emerald-500"
                              : b.score / b.maxScore >= 0.4
                                ? "bg-amber-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${(b.score / b.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Improving */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Improving Your Score
                </h3>
                <ul className="space-y-2">
                  {result.improving.map((i) => (
                    <li
                      key={i.factor}
                      className="p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {i.factor}
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5">{i.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Lowering */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Lowering Your Score
                </h3>
                <ul className="space-y-2">
                  {result.lowering.map((l) => (
                    <li
                      key={l.factor}
                      className="p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {l.factor}
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5">{l.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#6e44ff] mb-3">
                  💡 Suggestions to Improve
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 p-3 bg-[#6e44ff]/5 rounded-lg border border-[#6e44ff]/10 text-sm text-gray-700"
                    >
                      <span className="text-[#6e44ff] mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
