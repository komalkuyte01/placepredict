"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileDiff,
  FileSearch,
  FileText,
  FolderKanban,
  Lightbulb,
  Loader2,
  type LucideIcon,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ATSModal } from "@/components/landing/modals/ats-modal";
import { CompareModal } from "@/components/landing/modals/compare-modal";
import { JDMatchModal } from "@/components/landing/modals/jd-modal";
import { PredictionModal } from "@/components/landing/modals/prediction-modal";
import { ProjectModal } from "@/components/landing/modals/project-modal";
import { Footer } from "@/components/shared/footer";
import { NavHeader } from "@/components/shared/nav-header";

/**
 * Landing page — common entry point for all tools.
 * Uses Next.js routing to navigate to each tool.
 */
type ToolData = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  badge: string;
  recommended: boolean;
  actionText: string;
};

export function LandingPage() {
  const router = useRouter();
  const [isUploading, _setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTool, setSelectedTool] = useState<ToolData | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    breakpoints: {
      "(min-width: 640px)": { align: "start" },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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
      iconBg: "bg-[#1360fa]/10",
      iconColor: "text-[#1360fa]",
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
    "Upload your resume securely to our privacy-first platform.",
    "Select from 5 specialized AI-powered career tools.",
    "Process your data instantly against industry standards.",
    "Get comprehensive scores and actionable gap analyses.",
    "Apply personalized suggestions to boost your hiring chances.",
  ];

  const tools = [
    {
      href: "/prediction",
      icon: TrendingUp,
      title: "Placement Prediction",
      description:
        "Get placement probability with detailed analysis and personalized suggestions",
      color: "#1360fa",
      badge: "ML Powered",
      recommended: true,
      actionText: "Start Prediction",
    },
    {
      href: "/jd-matching",
      icon: FileSearch,
      title: "Job Description Match",
      description:
        "Upload a job description & resume to compute match score and identify gaps",
      color: "#06b6d4",
      badge: "AI Analysis",
      recommended: false,
      actionText: "Start Analysis",
    },
    {
      href: "/ats-score",
      icon: FileCheck,
      title: "Resume ATS Score",
      description:
        "Analyze your resume's ATS compatibility and get improvement suggestions",
      color: "#10b981",
      badge: "Resume Tool",
      recommended: false,
      actionText: "Get ATS Score",
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
      actionText: "Start Assessment",
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
      actionText: "Compare",
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
            <div className="w-16 h-16 rounded-full bg-[#1360fa]/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#1360fa] animate-spin" />
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
      <NavHeader />

      {/* Hero Section */}
      <section className="pt-22 sm:pt-28 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1360fa]/10 text-[#1360fa] text-xs font-medium mb-6 sm:mb-8 border border-[#1360fa]/20">
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Powered by Gemini AI & Machine Learning
              </span>
              <span className="sm:hidden">Gemini AI & ML Powered</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] sm:leading-[1.1] tracking-tight mb-4 sm:mb-6">
              Know Your <span className="text-[#1360fa]">Placement</span>
              <br />
              Chances Today
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
              Upload your resume and get instant AI-powered predictions with
              personalized improvement suggestions.
            </p>
            <div className="flex flex-row gap-2 sm:gap-3 justify-center">
              <button
                type="button"
                onClick={() => setSelectedTool(tools[0])}
                className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-[#1360fa] text-white rounded-full text-sm sm:text-base font-medium shadow-lg shadow-[#1360fa]/25 hover:bg-[#0d4fd4] hover:shadow-xl hover:shadow-[#1360fa]/30 transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                Get Prediction
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
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
          <div className="bg-[#1360fa]/5 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden border border-[#1360fa]/20 shadow-xl shadow-[#1360fa]/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1360fa]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1360fa]/10 rounded-full blur-3xl" />
            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-5">
                The Problem We Solve
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Students often struggle to understand their job placement
                prospects. Traditional assessments lack personalization and fail
                to provide actionable insights.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#1360fa] text-sm border border-[#1360fa]/20 shadow-sm">
                <TrendingUp className="w-4 h-4 text-[#1360fa]" />
                <span className="font-medium">
                  Our ML models analyze 17+ factors
                </span>
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
      <section id="tools" className="">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
              Placement Tools
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Everything you need to prepare for <br className="sm:hidden" />{" "}
              placements
            </p>
          </div>

          <div className="relative group">
            {/* Navigation Buttons (Desktop only) */}
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
              aria-label="Previous tools"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
              aria-label="Next tools"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={emblaRef}
              className="overflow-hidden pb-8 pt-4 -mx-4 sm:mx-0 px-4 sm:px-0"
            >
              <div className="flex -ml-4 sm:-ml-5">
                {tools.map((tool) => (
                  <div
                    key={tool.href}
                    className="flex-[0_0_75%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 sm:pl-5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTool(tool)}
                      className="text-left w-full flex flex-col min-h-[240px] sm:min-h-[280px] h-full relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1 group/card"
                      style={{ backgroundColor: `${tool.color}08` }}
                    >
                      {tool.recommended && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1360fa]/10 text-[#1360fa] text-xs font-semibold">
                            <Star className="w-3.5 h-3.5" /> Recommended
                          </span>
                        </div>
                      )}
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                        style={{
                          backgroundColor: `${tool.color}25`,
                        }}
                      >
                        <tool.icon
                          className="w-7 h-7 sm:w-8 sm:h-8"
                          style={{ color: tool.color }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                          {tool.title}
                        </h3>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed mb-4 text-gray-700">
                        {tool.description}
                      </p>
                      <div className="mt-auto pt-4 flex justify-start items-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-xs sm:text-sm font-medium transition-colors group-hover/card:bg-gray-800">
                          {tool.actionText}
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/card:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Objectives Section */}
      <section id="how-it-works" className="bg-gray-50/50">
        <div className="max-w-6xl mb-8 sm:mb-10 mt-4 sm:mt-6 mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-6 lg:gap-12 items-stretch">
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-xl shadow-gray-100/50 h-full">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#1360fa]" />
                <h3 className="font-bold text-gray-900">How It Works</h3>
              </div>
              <div className="space-y-3">
                {objectives.map((objective) => (
                  <div key={objective} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1360fa] flex-shrink-0 mt-2" />
                    <p className="text-gray-600 text-sm">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-xl shadow-gray-100/50 h-full">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Shield className="w-5 h-5 text-[#1360fa]" />
                <h3 className="font-bold text-gray-900">What We Analyze</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  "ML Placement Probability",
                  "ATS Parsing Compatibility",
                  "JD Keyword Coverage",
                  "Missing Skills Analysis",
                  "Project Complexity Rating",
                  "Resume A/B Comparison",
                  "Actionable Improvement Tips",
                  "Recruiter Impact Scoring",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 text-[10px] lg:text-[11px] xl:text-xs text-gray-600 py-1.5 sm:py-2 px-1.5 sm:px-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1360fa] flex-shrink-0" />
                    <span className="truncate tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Tool Info Modal */}
      {selectedTool && (
        // biome-ignore lint/a11y/useSemanticElements: Backdrop needs to be a div but also needs to be clickable
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTool(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              if (e.target === e.currentTarget) setSelectedTool(null);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedTool(null)}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="pt-12 px-6 pb-6 sm:px-8 sm:pb-8">
              {selectedTool.href === "/prediction" && (
                <PredictionModal color={selectedTool.color} />
              )}
              {selectedTool.href === "/jd-matching" && (
                <JDMatchModal color={selectedTool.color} />
              )}
              {selectedTool.href === "/ats-score" && (
                <ATSModal color={selectedTool.color} />
              )}
              {selectedTool.href === "/project-assessment" && (
                <ProjectModal color={selectedTool.color} />
              )}
              {selectedTool.href === "/resume-comparison" && (
                <CompareModal color={selectedTool.color} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
