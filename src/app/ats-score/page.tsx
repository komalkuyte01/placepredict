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
                <TrendingUp className="w-3.5 h-3.5" />
                <span>AI-Powered Resume Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
                Does Your Resume{" "}
                <span className="text-[#1360fa]">Beat the Bot?</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
                Upload your resume to instantly simulate how an Applicant
                Tracking System (ATS) will parse and rank your profile before it
                ever reaches a human recruiter.
              </p>
            </section>

            {/* Tool Area */}
            <section className="max-w-2xl mx-auto relative z-10 px-4 sm:px-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl shadow-gray-100/50">
                <FileUploadZone
                  label="Your Resume"
                  file={resumeFile}
                  onFileChange={setResumeFile}
                  hint="PDF file up to 5MB"
                />

                <div className="mt-8 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isLoading || !resumeFile}
                    className={cn(
                      "w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
                      isLoading || !resumeFile
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Analyzing
                        Document...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-5 h-5" /> Analyze ATS Score
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Files are processed locally and never stored permanently.
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
                  Uncover the logic behind our real-time ATS parsing.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Text Extraction
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We use advanced NLP to strip formatting and extract pure
                    text, exactly like top enterprise ATS software.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Keyword Evaluation
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Our AI models assess your document for critical missing
                    keywords, matching structures against typical roles.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Actionable Suggestions
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Get a tailored checklist mapping exactly what areas are
                    lowering your score and how to optimize them.
                  </p>
                </div>
              </div>
            </section>
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
