"use client";

import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target,
  Lightbulb,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import type { 
  CandidateProfile, 
  PlacementPrediction,
  FeatureContribution,
} from "@/lib/types/placement";

interface PredictionResultsProps {
  prediction: PlacementPrediction;
  profile: CandidateProfile;
  onReset: () => void;
}

// Chart colors - Vibrant shadcn style
const COLORS = {
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#ca8a04",
  red: "#dc2626",
  purple: "#9333ea",
  pink: "#db2777",
  cyan: "#0891b2",
  orange: "#ea580c",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Academic": COLORS.blue,
  "Technical": COLORS.purple,
  "Experience": COLORS.orange,
  "Soft Skills": COLORS.cyan,
};

/**
 * Prediction Results Display with Charts and Analysis.
 */
export function PredictionResults({ 
  prediction, 
  profile, 
  onReset 
}: PredictionResultsProps) {
  const probabilityColor = 
    prediction.probability >= 70 ? COLORS.green :
    prediction.probability >= 40 ? COLORS.yellow : COLORS.red;

  const riskIcon = 
    prediction.riskCategory === "Low" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
    prediction.riskCategory === "Medium" ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
    <XCircle className="w-5 h-5 text-red-500" />;

  // Prepare data for charts
  const categoryData = getCategoryData(prediction.featureContributions);
  const radarData = getRadarData(prediction.featureContributions);
  const contributionData = getTopContributions(prediction.featureContributions);

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

              <p className="text-[hsl(240,3.8%,46.1%)] max-w-lg">
                {prediction.improvementSuggestions.length > 0 
                  ? prediction.improvementSuggestions[0] 
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
            <Target className="w-5 h-5" />
            Score by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Score"]}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
            <TrendingUp className="w-5 h-5" />
            Skills Assessment
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                />
                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke={COLORS.blue}
                  fill={COLORS.blue}
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Contributions Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
            <TrendingUp className="w-5 h-5" />
            Feature Contributions
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  width={120}
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, "Contribution"]}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {contributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            Your Strengths ({prediction.strengths.length})
          </h3>
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

        {/* Weaknesses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Areas to Improve ({prediction.weaknesses.length})
          </h3>
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

      {/* Improvement Suggestions */}
      {prediction.weaknesses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Personalized Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.weaknesses
              .filter(w => w.priority === "Critical" || w.priority === "High")
              .slice(0, 4)
              .map((weakness, index) => (
                <div 
                  key={index}
                  className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <h4 className="font-medium text-[hsl(240,10%,3.9%)] mb-2">
                    {weakness.area}
                  </h4>
                  <p className="text-sm text-[hsl(240,3.8%,46.1%)]">
                    {weakness.suggestion}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

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

/**
 * Get category breakdown data for pie chart.
 * Derives categories from feature names.
 */
function getCategoryData(contributions: FeatureContribution[]) {
  const categoryMap: Record<string, string> = {
    "CGPA": "Academic",
    "Backlogs": "Academic",
    "10th Percentage": "Academic",
    "12th Percentage": "Academic",
    "Branch Relevance": "Academic",
    "Programming Languages": "Technical",
    "DSA Level": "Technical",
    "Projects Count": "Technical",
    "Has Internship": "Technical",
    "Certifications": "Technical",
    "Hackathons": "Experience",
    "Open Source": "Experience",
    "Resume Score": "Experience",
    "Aptitude Score": "Soft Skills",
    "Communication": "Soft Skills",
    "Mock Interview": "Soft Skills",
    "English Fluency": "Soft Skills",
  };

  const categories: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const c of contributions) {
    const cat = categoryMap[c.feature] || "Other";
    if (!categories[cat]) {
      categories[cat] = 0;
      counts[cat] = 0;
    }
    // Use importance as the basis for category scores
    categories[cat] += c.importance;
    counts[cat] += 1;
  }

  return Object.entries(categories).map(([name, value]) => ({
    name,
    value: Math.round(value / (counts[name] || 1)),
    color: CATEGORY_COLORS[name] || COLORS.blue,
  }));
}

/**
 * Get radar chart data.
 */
function getRadarData(contributions: FeatureContribution[]) {
  return contributions.slice(0, 8).map((c) => ({
    skill: c.feature,
    score: c.importance,
  }));
}

/**
 * Get top contributions for bar chart.
 */
function getTopContributions(contributions: FeatureContribution[]) {
  const categoryMap: Record<string, string> = {
    "CGPA": "Academic",
    "Backlogs": "Academic",
    "10th Percentage": "Academic",
    "12th Percentage": "Academic",
    "Branch Relevance": "Academic",
    "Programming Languages": "Technical",
    "DSA Level": "Technical",
    "Projects Count": "Technical",
    "Has Internship": "Technical",
    "Certifications": "Technical",
    "Hackathons": "Experience",
    "Open Source": "Experience",
    "Resume Score": "Experience",
    "Aptitude Score": "Soft Skills",
    "Communication": "Soft Skills",
    "Mock Interview": "Soft Skills",
    "English Fluency": "Soft Skills",
  };

  return contributions
    .map((c) => ({
      feature: c.feature,
      score: c.importance,
      color: CATEGORY_COLORS[categoryMap[c.feature] || "Other"] || COLORS.blue,
    }))
    .sort((a, b) => b.score - a.score);
}
