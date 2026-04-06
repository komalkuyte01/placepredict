"use client";

import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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

const getTheme = (isWinner: boolean, isTie: boolean) => {
  if (isTie) {
    return {
      text: "text-blue-500",
      bgBar: "bg-blue-400",
      bgPill: "bg-blue-50",
      textPill: "text-blue-600",
      bgCard: "bg-blue-50",
      borderCard: "border-blue-100",
      bulletText: "text-blue-400",
      headerText: "text-blue-500",
      borderMain: "border-blue-200",
    };
  }
  if (isWinner) {
    return {
      text: "text-emerald-600",
      bgBar: "bg-emerald-500",
      bgPill: "bg-emerald-100",
      textPill: "text-emerald-700",
      bgCard: "bg-emerald-50",
      borderCard: "border-emerald-100",
      bulletText: "text-emerald-500",
      headerText: "text-emerald-600",
      borderMain: "border-emerald-200",
    };
  }
  return {
    text: "text-red-400",
    bgBar: "bg-red-400",
    bgPill: "bg-red-50",
    textPill: "text-red-600",
    bgCard: "bg-red-50",
    borderCard: "border-red-100",
    bulletText: "text-red-400",
    headerText: "text-red-500",
    borderMain: "border-red-200",
  };
};

export default function ResumeComparisonPage() {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("compareSettings");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse Comparison result", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleReset = () => {
    sessionStorage.removeItem("compareSettings");
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
              Please start from the dashboard directly to compare resumes.
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
                            c.winner === "tie"
                              ? "bg-blue-50 text-blue-600"
                              : cn(
                                  getTheme(result.winner === c.winner, false)
                                    .bgPill,
                                  getTheme(result.winner === c.winner, false)
                                    .textPill,
                                ),
                          )}
                        >
                          {c.winner === "tie" ? "Tie" : `Version ${c.winner}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                getTheme(
                                  result.winner === "A",
                                  result.winner === "tie",
                                ).text,
                              )}
                            >
                              Version A
                            </span>
                            <span className="text-xs font-medium ml-auto">
                              {c.scoreA}/{c.maxScore}
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                getTheme(
                                  result.winner === "A",
                                  result.winner === "tie",
                                ).bgBar,
                              )}
                              style={{
                                width: `${(c.scoreA / c.maxScore) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                getTheme(
                                  result.winner === "B",
                                  result.winner === "tie",
                                ).text,
                              )}
                            >
                              Version B
                            </span>
                            <span className="text-xs font-medium ml-auto">
                              {c.scoreB}/{c.maxScore}
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                getTheme(
                                  result.winner === "B",
                                  result.winner === "tie",
                                ).bgBar,
                              )}
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
              <div
                className={cn(
                  "rounded-xl border p-6 transition-colors",
                  getTheme(result.winner === "A", result.winner === "tie")
                    .borderMain,
                  getTheme(result.winner === "A", result.winner === "tie")
                    .bgCard,
                )}
              >
                <h3
                  className={cn(
                    "text-lg font-semibold mb-3",
                    getTheme(result.winner === "A", result.winner === "tie")
                      .headerText,
                  )}
                >
                  Version A Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengthsA.map((s) => (
                    <li
                      key={s}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg text-sm text-gray-700 border bg-white/50",
                        getTheme(result.winner === "A", result.winner === "tie")
                          .borderCard,
                      )}
                    >
                      <span
                        className={
                          getTheme(
                            result.winner === "A",
                            result.winner === "tie",
                          ).bulletText
                        }
                      >
                        •
                      </span>{" "}
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={cn(
                  "rounded-xl border p-6 transition-colors",
                  getTheme(result.winner === "B", result.winner === "tie")
                    .borderMain,
                  getTheme(result.winner === "B", result.winner === "tie")
                    .bgCard,
                )}
              >
                <h3
                  className={cn(
                    "text-lg font-semibold mb-3",
                    getTheme(result.winner === "B", result.winner === "tie")
                      .headerText,
                  )}
                >
                  Version B Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengthsB.map((s) => (
                    <li
                      key={s}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg text-sm text-gray-700 border bg-white/50",
                        getTheme(result.winner === "B", result.winner === "tie")
                          .borderCard,
                      )}
                    >
                      <span
                        className={
                          getTheme(
                            result.winner === "B",
                            result.winner === "tie",
                          ).bulletText
                        }
                      >
                        •
                      </span>{" "}
                      {s}
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
