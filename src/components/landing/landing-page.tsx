"use client";

import {
  ArrowRight,
  BarChart3,
  Brain,
  FileCheck,
  FileDiff,
  FileSearch,
  FileText,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Loader2,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Footer } from "@/components/shared/footer";

/**
 * Landing page — common entry point for all tools.
 * Uses Next.js routing to navigate to each tool.
 */
export function LandingPage() {
  const router = useRouter();
  const [isUploading, _setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      // For now, just navigate to prediction page — the upload happens there
      router.push("/prediction");
    },
    [router],
  );

  const features = [
    {
      icon: FileText,
      title: "Resume Parsing",
      description: "AI extracts details from resume automatically",
      iconBg: "bg-[#6e44ff]/10",
      iconColor: "text-[#6e44ff]",
    },
    {
      icon: Brain,
      title: "ML Engine",
      description: "Models predict placement probability",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Tailored suggestions for your improvements",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Visual breakdown of impacting factors",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  const objectives = [
    "Parse resume data to extract relevant information",
    "Predict student performance with ML models",
    "Identify skills gaps and recommend improvements",
    "Provide actionable career suggestions",
  ];

  const tools = [
    {
      href: "/prediction",
      icon: TrendingUp,
      title: "Placement Prediction",
      description:
        "Get ML-powered placement probability with detailed analysis and personalized suggestions",
      color: "#6e44ff",
      badge: "ML Powered",
      recommended: true,
    },
    {
      href: "/jd-matching",
      icon: FileSearch,
      title: "JD Matching",
      description:
        "Upload a job description & resume to compute match score and identify gaps",
      color: "#06b6d4",
      badge: "AI Analysis",
      recommended: false,
    },
    {
      href: "/ats-score",
      icon: FileCheck,
      title: "ATS Score",
      description:
        "Analyze your resume's ATS compatibility and get improvement suggestions",
      color: "#10b981",
      badge: "Resume Tool",
      recommended: false,
    },
    {
      href: "/project-assessment",
      icon: FolderKanban,
      title: "Project Assessment",
      description:
        "Rate your projects, discover covered skills, and get recruiter-focused suggestions",
      color: "#f59e0b",
      badge: "Assessment",
      recommended: false,
    },
    {
      href: "/resume-comparison",
      icon: FileDiff,
      title: "Resume Comparison",
      description:
        "Compare multiple resume versions to find which performs better and why",
      color: "#ec4899",
      badge: "Comparison",
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-16 h-16 rounded-full bg-[#6e44ff]/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#6e44ff] animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Parsing Resume
              </h3>
              <p className="text-sm text-gray-500">
                AI is extracting your details...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#6e44ff] flex items-center justify-center shadow-lg shadow-[#6e44ff]/20">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                PlacePredict
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
              <a
                href="#features"
                className="hidden sm:block text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#tools"
                className="hidden sm:block text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                Tools
              </a>
              <a
                href="#get-started"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-22 sm:pt-28 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6e44ff]/10 text-[#6e44ff] text-xs font-medium mb-6 sm:mb-8 border border-[#6e44ff]/20">
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Powered by Gemini AI & Machine Learning
              </span>
              <span className="sm:hidden">Gemini AI & ML Powered</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] sm:leading-[1.1] tracking-tight mb-4 sm:mb-6">
              Know Your <span className="text-[#6e44ff]">Placement</span>
              <br />
              Chances Today
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
              Upload your resume and get instant AI-powered predictions with
              personalized improvement suggestions.
            </p>
            <div className="flex flex-row gap-2 sm:gap-3 justify-center">
              <Link
                href="/prediction"
                className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-[#6e44ff] text-white rounded-full text-sm sm:text-base font-medium shadow-lg shadow-[#6e44ff]/25 hover:bg-[#5c35e6] hover:shadow-xl hover:shadow-[#6e44ff]/30 transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                Get Prediction
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#tools"
                className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-gray-100 text-gray-700 rounded-full text-sm sm:text-base font-medium border border-gray-300 hover:border-gray-400 hover:bg-gray-200 transition-all duration-200"
              >
                Explore Tools
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6e44ff]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5">
                The Problem We Solve
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Students often struggle to understand their job placement
                prospects. Traditional assessments lack personalization and fail
                to provide actionable insights.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 text-[#6e44ff]" />
                <span>Our ML models analyze 17+ factors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
              Powerful Features
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Advance AI and ML for comprehensive <br></br>placement analysis
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 text-center"
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${feature.iconBg} flex items-center justify-center mb-3 sm:mb-4 mx-auto`}
                >
                  <feature.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${feature.iconColor}`}
                  />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
              All Tools
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Everything you need to prepare for placements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative p-5 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                {tool.recommended && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6e44ff]/10 text-[#6e44ff] text-xs font-medium">
                      <Star className="w-3 h-3" /> Recommended
                    </span>
                  </div>
                )}
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg"
                  style={{
                    backgroundColor: `${tool.color}15`,
                    boxShadow: `0 4px 14px ${tool.color}20`,
                  }}
                >
                  <tool.icon
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    style={{ color: tool.color }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {tool.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-3">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${tool.color}15`,
                      color: tool.color,
                    }}
                  >
                    {tool.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Objectives Section */}
      <section id="how-it-works" className="bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-6 lg:gap-12 items-stretch">
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-xl shadow-gray-100/50 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#6e44ff]" />
                <h3 className="font-bold text-gray-900">How It Works</h3>
              </div>
              <div className="space-y-3">
                {objectives.map((objective) => (
                  <div key={objective} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6e44ff] flex-shrink-0 mt-2" />
                    <p className="text-gray-600 text-sm">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-xl shadow-gray-100/50 h-full">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Shield className="w-5 h-5 text-[#6e44ff]" />
                <h3 className="font-semibold text-gray-900">What We Analyze</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  "CGPA & Academics",
                  "Technical Skills",
                  "Projects Count",
                  "Internships",
                  "Certifications",
                  "Hackathons",
                  "Communication",
                  "ATS Score",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6e44ff] flex-shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA Section */}
      <section id="get-started" className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="bg-gradient-to-br from-[#6e44ff] to-[#5c35e6] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
                Ready to Know Your Chances?
              </h2>
              <p className="text-white/70 max-w-md mx-auto mb-6 text-sm sm:text-base">
                Start with a placement prediction or explore our powerful resume
                tools.
              </p>
              <div className="flex flex-row gap-3 justify-center">
                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#6e44ff] rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <TrendingUp className="w-4 h-4" />
                  Get Prediction
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
