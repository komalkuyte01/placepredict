"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  AlertOctagon,
  ChevronDown,
  Loader2,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { 
  CandidateProfile, 
  PlacementPrediction,
  IssueItem,
} from "@/lib/types/placement";

interface AISuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface PredictionResultsProps {
  prediction: PlacementPrediction;
  profile: CandidateProfile;
  onReset: () => void;
  issues?: IssueItem[];
}

// Chart colors - Vibrant shadcn style
const COLORS = {
  green: "#16a34a",
  yellow: "#ca8a04",
  red: "#dc2626",
};

/**
 * Prediction Results Display with Analysis.
 */
export function PredictionResults({ 
  prediction, 
  profile, 
  onReset,
  issues = [],
}: PredictionResultsProps) {
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<{
    issues: boolean;
    strengths: boolean;
    weaknesses: boolean;
  }>({ issues: false, strengths: false, weaknesses: false });

  const toggleSection = (section: 'issues' | 'strengths' | 'weaknesses') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSuggestion = (index: number) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Fetch AI suggestions
  useEffect(() => {
    const fetchAISuggestions = async () => {
      try {
        setIsLoadingAI(true);
        const response = await fetch('/api/ai-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, prediction }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch AI suggestions:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAISuggestions();
  }, [profile, prediction]);
  
  // Cycle through suggestions every 5 seconds with animation
  useEffect(() => {
    if (prediction.improvementSuggestions.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSuggestionIndex(prev => 
          (prev + 1) % prediction.improvementSuggestions.length
        );
        setIsAnimating(false);
      }, 300);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [prediction.improvementSuggestions.length]);

  const probabilityColor = 
    prediction.probability >= 70 ? COLORS.green :
    prediction.probability >= 40 ? COLORS.yellow : COLORS.red;

  const riskIcon = 
    prediction.riskCategory === "Low" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
    prediction.riskCategory === "Medium" ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
    <XCircle className="w-5 h-5 text-red-500" />;

  return (
    <div className="space-y-8">
      {/* Main Result Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Probability Circle */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-[hsl(240,4.8%,95.9%)]"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={probabilityColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${prediction.probability * 5.53} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className="text-5xl font-bold"
                  style={{ color: probabilityColor }}
                >
                  {prediction.probability}%
                </span>
                <span className="text-sm text-[hsl(240,3.8%,46.1%)] mt-1">Probability</span>
              </div>
            </div>

            {/* Summary Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[hsl(240,10%,3.9%)] mb-2">
                Placement Prediction Result
              </h2>
              
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                {riskIcon}
                <span className={cn(
                  "text-lg font-semibold",
                  prediction.riskCategory === "Low" && "text-emerald-600",
                  prediction.riskCategory === "Medium" && "text-amber-600",
                  prediction.riskCategory === "High" && "text-red-600"
                )}>
                  {prediction.riskCategory} Risk
                </span>
              </div>

              <p 
                className={cn(
                  "text-[hsl(240,3.8%,46.1%)] max-w-lg transition-all duration-300",
                  isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}
              >
                {prediction.improvementSuggestions.length > 0 
                  ? prediction.improvementSuggestions[currentSuggestionIndex] 
                  : "Analyze your profile to identify areas for improvement."}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="px-8 py-4 bg-[hsl(240,4.8%,95.9%)] border-t border-gray-200">
          <div className="flex items-start gap-2 text-sm text-[hsl(240,3.8%,46.1%)]">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Disclaimer:</strong> This prediction is probabilistic, not deterministic. 
              The model may have biases based on training data. Use this as guidance only, 
              not as a definitive assessment of your placement chances.
            </p>
          </div>
        </div>
      </div>

      {/* Issues, Strengths & Weaknesses */}
      <div className="space-y-6">
        {/* Issues - Irrelevant Skills/Certifications */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('issues')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2 text-orange-600">
            <AlertOctagon className="w-5 h-5" />
            Issues ({issues.length})
          </h3>
          <ChevronDown className={cn(
            "w-5 h-5 text-gray-500 transition-transform duration-200",
            expandedSections.issues && "rotate-180"
          )} />
        </button>
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          expandedSections.issues ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="px-6 pb-6">
        {issues.length > 0 ? (
          <>
            <p className="text-sm text-[hsl(240,3.8%,46.1%)] mb-4">
              The following skills or certifications may not be relevant for a Software Developer role:
            </p>
            <ul className="space-y-3">
              {issues.map((issue, index) => (
                <li key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[hsl(240,10%,3.9%)]">
                        {issue.name}
                      </span>
                      <span className={cn(
                        "ml-2 text-xs px-2 py-0.5 rounded-full",
                        issue.type === "skill" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      )}>
                        {issue.type === "skill" ? "Skill" : "Certification"}
                      </span>
                      <p className="text-sm text-[hsl(240,3.8%,46.1%)] mt-1">
                        {issue.reason}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-[hsl(240,3.8%,46.1%)] text-center py-4">
            Great! All your skills and certifications are relevant for a Software Developer role.
          </p>
        )}
          </div>
        </div>
        </div>

        {/* Strengths & Areas to Improve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Strengths */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('strengths')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              Your Strengths ({prediction.strengths.length})
            </h3>
            <ChevronDown className={cn(
              "w-5 h-5 text-gray-500 transition-transform duration-200",
              expandedSections.strengths && "rotate-180"
            )} />
          </button>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            expandedSections.strengths ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="px-6 pb-6">
          {prediction.strengths.length > 0 ? (
            <ul className="space-y-3">
              {prediction.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                  <div>
                    <span className="font-medium text-[hsl(240,10%,3.9%)]">
                      {strength.area}
                    </span>
                    <span className="text-[hsl(240,3.8%,46.1%)] ml-2">
                      — {strength.value}
                    </span>
                    <span className={cn(
                      "ml-2 text-xs px-2 py-0.5 rounded-full",
                      strength.impact === "High" && "bg-emerald-200 text-emerald-800",
                      strength.impact === "Medium" && "bg-amber-200 text-amber-800",
                      strength.impact === "Low" && "bg-gray-200 text-gray-700"
                    )}>
                      {strength.impact} Impact
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[hsl(240,3.8%,46.1%)] text-center py-4">
              No significant strengths identified. Focus on building your profile.
            </p>
          )}
            </div>
          </div>
          </div>

          {/* Areas to Improve */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('weaknesses')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Areas to Improve ({prediction.weaknesses.length})
            </h3>
            <ChevronDown className={cn(
              "w-5 h-5 text-gray-500 transition-transform duration-200",
              expandedSections.weaknesses && "rotate-180"
            )} />
          </button>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            expandedSections.weaknesses ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="px-6 pb-6">
          {prediction.weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {prediction.weaknesses.map((weakness, index) => (
                <li key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-start gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-[hsl(240,10%,3.9%)]">
                        {weakness.area}
                      </span>
                      <span className={cn(
                        "ml-2 text-xs px-2 py-0.5 rounded-full",
                        weakness.priority === "Critical" && "bg-red-200 text-red-800",
                        weakness.priority === "High" && "bg-orange-200 text-orange-800",
                        weakness.priority === "Medium" && "bg-amber-200 text-amber-800",
                        weakness.priority === "Low" && "bg-gray-200 text-gray-700"
                      )}>
                        {weakness.priority} Priority
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[hsl(240,3.8%,46.1%)] ml-6">
                    Current: <span className="text-red-600">{weakness.currentValue}</span>
                    {" → "}
                    Target: <span className="text-emerald-600">{weakness.targetValue}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[hsl(240,3.8%,46.1%)] text-center py-4">
              Great! No significant weaknesses identified.
            </p>
          )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Suggestions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
          <Bot className="w-5 h-5 text-purple-600" />
          Personalized Suggestions
        </h3>
        {isLoadingAI ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-2" />
            <span className="text-[hsl(240,3.8%,46.1%)]">Generating personalized suggestions...</span>
          </div>
        ) : aiSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map((suggestion, index) => {
              const isExpanded = expandedSuggestions.has(index);
              const shouldTruncate = suggestion.description.length > 80;
              const displayText = isExpanded || !shouldTruncate 
                ? suggestion.description 
                : suggestion.description.slice(0, 80);
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border",
                    suggestion.priority === "high" && "bg-purple-50 border-purple-200",
                    suggestion.priority === "medium" && "bg-blue-50 border-blue-200",
                    suggestion.priority === "low" && "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-[hsl(240,10%,3.9%)]">
                      {suggestion.title}
                    </h4>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2",
                      suggestion.priority === "high" && "bg-purple-200 text-purple-800",
                      suggestion.priority === "medium" && "bg-blue-200 text-blue-800",
                      suggestion.priority === "low" && "bg-gray-200 text-gray-700"
                    )}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(240,3.8%,46.1%)]">
                    {displayText}
                    {shouldTruncate && !isExpanded && "... "}
                    {shouldTruncate && (
                      <button
                        type="button"
                        onClick={() => toggleSuggestion(index)}
                        className="text-purple-600 hover:text-purple-800 font-medium ml-1"
                      >
                        {isExpanded ? "show less" : "read more"}
                      </button>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[hsl(240,3.8%,46.1%)] text-center py-4">
            No suggestions available at this time.
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className={cn(
            "px-8 py-3 rounded-lg font-semibold",
            "bg-[hsl(240,5.9%,10%)]",
            "text-white",
            "hover:bg-[hsl(240,5.9%,20%)]",
            "transition-colors"
          )}
        >
          Analyze Another Profile
        </button>
      </div>
    </div>
  );
}
