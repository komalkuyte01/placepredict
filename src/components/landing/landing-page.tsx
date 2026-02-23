"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Brain,
  Target,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Users,
} from "lucide-react";

interface LandingPageProps {
  onSelectOption: (option: "upload" | "manual") => void;
}

export function LandingPage({ onSelectOption }: LandingPageProps) {
  const [hoveredCard, setHoveredCard] = useState<"upload" | "manual" | null>(null);

  const features = [
    {
      icon: FileText,
      title: "Smart Resume Parsing",
      description: "AI-powered extraction of CGPA, skills, projects, and experience from your resume",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "ML Prediction Engine",
      description: "Advanced ensemble models predict your placement probability with high accuracy",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Lightbulb,
      title: "Personalized Insights",
      description: "Get tailored suggestions for skills to acquire and areas to improve",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Understand which factors impact your chances most with visual breakdowns",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const objectives = [
    "Parse resume data to extract relevant information (CGPA, skills, projects, etc.)",
    "Train ML models to predict student performance and job placement chances",
    "Identify skills gaps and recommend courses or certifications",
    "Provide actionable suggestions for academic and professional improvement",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PlacePredict
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                How it Works
              </a>
              <a href="#get-started" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by Machine Learning & Gemini AI
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Predict Your{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Placement Success
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your resume or enter your details to get AI-powered predictions on your job placement chances, 
              along with personalized suggestions for improvement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onSelectOption("upload")}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onSelectOption("manual")}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-800 rounded-2xl font-semibold text-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-1"
              >
                <FileText className="w-5 h-5" />
                Enter Manually
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "95%", label: "Accuracy Rate", icon: Target },
              { value: "10K+", label: "Predictions Made", icon: Users },
              { value: "50+", label: "Skills Analyzed", icon: Briefcase },
              { value: "24/7", label: "AI Available", icon: Brain },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:shadow-lg transition-shadow"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              The Problem We Solve
            </h2>
            <p className="text-lg text-indigo-100 leading-relaxed mb-8">
              Students often struggle to understand their job placement prospects and what specific improvements 
              can boost their chances. Traditional assessment methods lack personalization and fail to provide 
              actionable insights based on individual profiles.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white backdrop-blur-sm">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Our ML models analyze 17+ factors for accurate predictions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with machine learning to provide comprehensive placement analysis
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Our Objectives
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We're committed to helping students understand and improve their placement prospects through 
                data-driven insights and personalized recommendations.
              </p>
              <div className="space-y-4">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-slate-700">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">What We Analyze</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "CGPA & Academics",
                    "Technical Skills",
                    "Projects Count",
                    "Internship Experience",
                    "Certifications",
                    "Hackathon Participation",
                    "Communication Skills",
                    "Resume ATS Score",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select the method that works best for you to get your personalized placement prediction
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Upload Resume Card */}
            <div
              onMouseEnter={() => setHoveredCard("upload")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onSelectOption("upload")}
              className={`relative cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
                hoveredCard === "upload"
                  ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl shadow-indigo-500/20 -translate-y-2"
                  : "border-slate-200 bg-white hover:border-indigo-200"
              }`}
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" /> Recommended
                </span>
              </div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Upload Your Resume</h3>
              <p className="text-slate-600 mb-6">
                Let our AI extract all relevant information from your resume automatically. 
                Get instant results with Gemini AI-powered parsing.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Automatic data extraction",
                  "AI-calculated ATS score",
                  "Faster process (~30 seconds)",
                  "Supports PDF format",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                Get Started with Resume
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Manual Entry Card */}
            <div
              onMouseEnter={() => setHoveredCard("manual")}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onSelectOption("manual")}
              className={`relative cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
                hoveredCard === "manual"
                  ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-2xl shadow-emerald-500/20 -translate-y-2"
                  : "border-slate-200 bg-white hover:border-emerald-200"
              }`}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Enter Details Manually</h3>
              <p className="text-slate-600 mb-6">
                Fill in your academic records, skills, and experience manually. 
                Perfect for those who want complete control over their data.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Full control over data",
                  "No resume required",
                  "Edit anytime",
                  "Detailed field options",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                Get Started Manually
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PlacePredict</span>
            </div>
            <p className="text-slate-400 text-sm text-center">
              Empowering students with AI-driven placement predictions and personalized career guidance.
            </p>
            <div className="text-slate-500 text-sm">
              © {new Date().getFullYear()} PlacePredict. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
