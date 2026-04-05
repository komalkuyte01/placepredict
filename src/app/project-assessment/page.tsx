"use client";

import { ArrowLeft, FolderKanban, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";
import { cn } from "@/lib/utils/cn";

interface ProjectResult {
  score: number;
  complexityRating: string;
  relevanceRating: string;
  skillsCovered: string[];
  strengths: string[];
  suggestions: string[];
  recruiterTips: string[];
}

export default function ProjectAssessmentPage() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProjectResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!projectDescription.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/project-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, projectDescription, techStack }),
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        alert("Assessment failed. Please try again.");
      }
    } catch {
      alert("Failed to assess. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projectName, projectDescription, techStack]);

  const handleReset = () => {
    setProjectName("");
    setProjectDescription("");
    setTechStack("");
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
                <FolderKanban className="w-3.5 h-3.5" />
                <span>AI-Powered Project Analysis</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-4">
                Get Your Projects{" "}
                <span className="text-[#1360fa]">Evaluated</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
                Describe your project to get rated by our AI. Receive instant
                feedback on its complexity, real-world applicability, and
                actionable suggestions to make it stand out.
              </p>
            </section>

            {/* Tool Area */}
            <section className="max-w-2xl mx-auto relative z-10 px-4 sm:px-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl shadow-gray-100/50">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="project-name"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Project Name
                    </label>
                    <input
                      id="project-name"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 transition-all"
                      placeholder="e.g., Real-time Chat Application"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="project-description"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Project Description{" "}
                      <span className="text-[#1360fa]">*</span>
                    </label>
                    <textarea
                      id="project-description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe what the project does, features implemented, architecture, challenges solved..."
                      rows={5}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 resize-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="tech-stack"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Tech Stack
                    </label>
                    <input
                      id="tech-stack"
                      type="text"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 transition-all"
                      placeholder="e.g., React, Node.js, MongoDB, Docker"
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isLoading || !projectDescription.trim()}
                    className={cn(
                      "w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
                      isLoading || !projectDescription.trim()
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Assessing
                        Project...
                      </>
                    ) : (
                      <>
                        <FolderKanban className="w-5 h-5" /> Assess Project
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Analysis is entirely private and not used for training.
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
                  Learn how we evaluate your portfolio pieces.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Complexity Rating
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We analyze your tech stack against the features built to
                    determine if the project is a simple tutorial or a robust
                    application.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Real-world Value
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Evaluates if the project solves an actual business problem,
                    showcasing your readiness for enterprise environments.
                  </p>
                </div>
                <div className="bg-[#FAFBFC] rounded-2xl p-6 border border-gray-100 text-center hover:border-[#1360fa]/20 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1360fa] font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Standout Potential
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Receive specific advice on missing features, architecture
                    improvements, or integrations you could add to impress
                    recruiters.
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
                    {projectName || "Project"} Assessment
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

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Assess Another Project
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
