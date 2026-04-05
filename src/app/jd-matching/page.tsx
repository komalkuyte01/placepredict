"use client";

import { ArrowLeft, FileSearch, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";
import { cn } from "@/lib/utils/cn";

interface JDMatchResult {
  overallScore: number;
  missingSkills: { skill: string; importance: "high" | "medium" | "low" }[];
  missingExperience: string[];
  experienceMismatch: string | null;
  matchingSkills: string[];
  keywordCoverage: number;
  suggestions: string[];
  detailedAnalysis: string;
}

export default function JDMatchingPage() {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JDMatchResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    if ((!jdFile && !jdText.trim()) || !resumeFile) return;
    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (jdFile) formData.append("jd", jdFile);
      else formData.append("jdText", jdText);
      formData.append("resume", resumeFile);

      const response = await fetch("/api/jd-matching", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        const err = await response.text();
        alert(`Analysis failed: ${err}`);
      }
    } catch {
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [jdFile, jdText, resumeFile]);

  const handleReset = () => {
    setJdFile(null);
    setResumeFile(null);
    setJdText("");
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
                JD Matching Analysis
              </h1>
              <p className="text-gray-500 text-sm">
                Upload a job description and your resume to find how well you
                match
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <FileUploadZone
                  label="Job Description"
                  file={jdFile}
                  onFileChange={setJdFile}
                  hint="PDF or paste text"
                  allowText
                  textValue={jdText}
                  onTextChange={setJdText}
                  textPlaceholder="Paste the job description here..."
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <FileUploadZone
                  label="Your Resume"
                  file={resumeFile}
                  onFileChange={setResumeFile}
                  hint="PDF file"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={
                  isLoading || (!jdFile && !jdText.trim()) || !resumeFile
                }
                className={cn(
                  "px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors",
                  "bg-cyan-600 text-white hover:bg-cyan-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <FileSearch className="w-5 h-5" /> Analyze Match
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    role="img"
                    aria-label="JD match score chart"
                  >
                    <title>JD Match Score</title>
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
                        result.overallScore >= 70
                          ? "#16a34a"
                          : result.overallScore >= 40
                            ? "#ca8a04"
                            : "#dc2626"
                      }
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${result.overallScore * 4.4} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-4xl font-bold"
                      style={{
                        color:
                          result.overallScore >= 70
                            ? "#16a34a"
                            : result.overallScore >= 40
                              ? "#ca8a04"
                              : "#dc2626",
                      }}
                    >
                      {result.overallScore}%
                    </span>
                    <span className="text-xs text-gray-500">Match Score</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    JD Match Results
                  </h2>
                  <p className="text-gray-500 mb-3">
                    Keyword Coverage:{" "}
                    <span className="font-semibold text-gray-900">
                      {result.keywordCoverage}%
                    </span>
                  </p>
                  {result.experienceMismatch && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                      ⚠️ {result.experienceMismatch}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Matching Skills */}
            {result.matchingSkills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-600 mb-3">
                  ✅ Matching Skills ({result.matchingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills.map((s) => (
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

            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-3">
                  ❌ Missing Skills ({result.missingSkills.length})
                </h3>
                <div className="space-y-2">
                  {result.missingSkills.map((s) => (
                    <div
                      key={s.skill}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {s.skill}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          s.importance === "high"
                            ? "bg-red-200 text-red-800"
                            : s.importance === "medium"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-gray-200 text-gray-700",
                        )}
                      >
                        {s.importance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Experience */}
            {result.missingExperience.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-amber-600 mb-3">
                  📋 Missing Experience / Projects
                </h3>
                <ul className="space-y-2">
                  {result.missingExperience.map((e) => (
                    <li
                      key={e}
                      className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-gray-700"
                    >
                      <span className="text-amber-500 mt-0.5">•</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Analysis */}
            {result.detailedAnalysis && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📝 Detailed Analysis
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {result.detailedAnalysis}
                </p>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-[#6e44ff] mb-3">
                  💡 Suggestions to Improve Match
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
                Analyze Another
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
