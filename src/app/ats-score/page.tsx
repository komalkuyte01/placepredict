"use client";

import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";
import { cn } from "@/lib/utils/cn";

interface ATSResult {
  score: number;
  improving: { factor: string; detail: string }[];
  lowering: { factor: string; detail: string }[];
  suggestions: string[];
  breakdown: { category: string; score: number; maxScore: number }[];
}

export default function ATSScorePage() {
  const [result, setResult] = useState<ATSResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("atsSettings");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse ATS result", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleReset = () => {
    sessionStorage.removeItem("atsSettings");
    window.location.href = "/";
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      <NavHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pb-10 flex-1 pt-22 md:pt-24">
        {!result ? (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Data Found
            </h1>
            <p className="text-gray-500 mb-8">
              Please start from the dashboard directly to upload your resume.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1360fa] text-white font-medium hover:bg-[#5c35e6] transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-600 text-sm border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
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

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
