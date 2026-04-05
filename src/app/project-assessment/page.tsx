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
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Project Assessment
              </h1>
              <p className="text-gray-500 text-sm">
                Describe your project to get rated and receive improvement
                suggestions
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="project-name"
                  className="block text-sm font-medium text-gray-900"
                >
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full"
                  placeholder="e.g., E-Commerce Platform, Chat Application"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium text-gray-900"
                >
                  Project Description *
                </label>
                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe what the project does, features implemented, architecture, challenges solved..."
                  rows={6}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#6e44ff]/40 focus:ring-2 focus:ring-[#6e44ff]/10 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="tech-stack"
                  className="block text-sm font-medium text-gray-900"
                >
                  Tech Stack
                </label>
                <input
                  id="tech-stack"
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full"
                  placeholder="e.g., React, Node.js, MongoDB, Docker"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || !projectDescription.trim()}
                className={cn(
                  "px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Assessing...
                  </>
                ) : (
                  <>
                    <FolderKanban className="w-5 h-5" /> Assess Project
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
