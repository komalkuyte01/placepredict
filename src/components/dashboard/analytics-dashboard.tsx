"use client";

import { Tabs } from "@ark-ui/react/tabs";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Clock,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { StatCard, Badge, ProgressBar } from "@/components/ui/elements";
import {
  GradeDistributionChart,
  GenderDistributionChart,
  CorrelationChart,
  RiskDistributionChart,
  PerformanceRadarChart,
  StudyTimeDistributionChart,
} from "@/components/charts/analytics-charts";
import type {
  DatasetStatistics,
  PredictionResult,
  StudentRecord,
} from "@/lib/types/student";
import { GRADE_LABELS, type GradeClass } from "@/lib/types/student";

/**
 * Props for the AnalyticsDashboard component.
 */
interface AnalyticsDashboardProps {
  /** Dataset statistics */
  statistics: DatasetStatistics;
  /** Prediction results */
  predictions: PredictionResult[];
  /** Student records */
  students: StudentRecord[];
}

/**
 * Comprehensive analytics dashboard for student performance data.
 */
export function AnalyticsDashboard({
  statistics,
  predictions,
  students,
}: AnalyticsDashboardProps) {
  // Calculate risk distribution
  const riskDistribution = predictions.reduce(
    (acc, pred) => {
      acc[pred.riskLevel]++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 },
  );

  // Calculate average metrics for radar chart
  const avgMetrics = {
    studyTime: Math.min(100, (statistics.averageStudyTime / 20) * 100),
    attendance: Math.max(0, 100 - statistics.averageAbsences * 3),
    gpa: (statistics.averageGpa / 4) * 100,
    engagement:
      (students.filter((s) => s.extracurricular).length / students.length) *
      100,
    support:
      (students.filter((s) => s.parentalSupport !== "Low").length /
        students.length) *
      100,
  };

  // Get high risk students
  const highRiskStudents = predictions
    .filter((p) => p.riskLevel === "high")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={statistics.totalStudents}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          label="Average GPA"
          value={statistics.averageGpa.toFixed(2)}
          icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
          trend={statistics.averageGpa >= 2.5 ? "up" : "down"}
          trendValue={
            statistics.averageGpa >= 2.5 ? "Above average" : "Needs attention"
          }
        />
        <StatCard
          label="Avg Study Time"
          value={`${statistics.averageStudyTime.toFixed(1)}h`}
          icon={<Clock className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          label="At-Risk Students"
          value={riskDistribution.high}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          trend={riskDistribution.high > 0 ? "down" : "neutral"}
          trendValue={`${((riskDistribution.high / statistics.totalStudents) * 100).toFixed(1)}%`}
        />
      </div>

      {/* Tabbed Analytics */}
      <Tabs.Root defaultValue="overview" className="w-full">
        <Tabs.List
          className={cn(
            "flex items-center gap-1 p-1",
            "bg-[hsl(210,40%,96.1%)]",
            "rounded-lg overflow-x-auto",
          )}
        >
          <Tabs.Trigger
            value="overview"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "transition-colors duration-150",
              "text-[hsl(240,3.8%,46.1%)]",
              "hover:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:bg-white",
              "data-[selected]:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:shadow-sm",
            )}
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="predictions"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "transition-colors duration-150",
              "text-[hsl(240,3.8%,46.1%)]",
              "hover:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:bg-white",
              "data-[selected]:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:shadow-sm",
            )}
          >
            Predictions
          </Tabs.Trigger>
          <Tabs.Trigger
            value="correlations"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "transition-colors duration-150",
              "text-[hsl(240,3.8%,46.1%)]",
              "hover:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:bg-white",
              "data-[selected]:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:shadow-sm",
            )}
          >
            Correlations
          </Tabs.Trigger>
          <Tabs.Trigger
            value="at-risk"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md",
              "transition-colors duration-150",
              "text-[hsl(240,3.8%,46.1%)]",
              "hover:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:bg-white",
              "data-[selected]:text-[hsl(222.2,47.4%,11.2%)]",
              "data-[selected]:shadow-sm",
            )}
          >
            At-Risk Students
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of predicted/actual grades across all students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GradeDistributionChart
                  distribution={statistics.gradeDistribution}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Students categorized by academic risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskDistributionChart distribution={riskDistribution} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Average performance across key indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceRadarChart metrics={avgMetrics} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>
                  Gender distribution in the dataset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenderDistributionChart
                  distribution={statistics.genderDistribution}
                />
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        {/* Predictions Tab */}
        <Tabs.Content value="predictions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
                <CardDescription>
                  Weekly study hours across the student population
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudyTimeDistributionChart
                  studyTimes={students.map((s) => s.studyTimeWeekly)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([0, 1, 2, 3, 4] as GradeClass[]).map((grade) => {
                  const count = predictions.filter(
                    (p) => p.predictedGrade === grade,
                  ).length;
                  const percentage = (count / predictions.length) * 100;

                  return (
                    <div key={grade}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[hsl(222.2,47.4%,11.2%)]">
                          {GRADE_LABELS[grade]}
                        </span>
                        <span className="text-sm text-slate-500">{count}</span>
                      </div>
                      <ProgressBar
                        value={percentage}
                        variant={
                          grade === 0
                            ? "success"
                            : grade <= 2
                              ? "default"
                              : "danger"
                        }
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        {/* Correlations Tab */}
        <Tabs.Content value="correlations" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Feature Correlations with GPA</CardTitle>
                <CardDescription>
                  Pearson correlation coefficients between features and academic
                  performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CorrelationChart
                  correlations={statistics.featureCorrelations}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statistics.featureCorrelations.slice(0, 6).map((corr) => (
                    <div
                      key={corr.feature}
                      className={cn(
                        "p-4 rounded-lg border",
                        corr.correlation >= 0
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-red-200 bg-red-50",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[hsl(222.2,47.4%,11.2%)]">
                          {corr.feature}
                        </span>
                        <Badge
                          variant={
                            corr.strength === "strong"
                              ? "success"
                              : corr.strength === "moderate"
                                ? "warning"
                                : "default"
                          }
                        >
                          {corr.strength}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className={cn(
                            "w-4 h-4",
                            corr.correlation >= 0
                              ? "text-emerald-600"
                              : "text-red-600 rotate-180",
                          )}
                        />
                        <span
                          className={cn(
                            "text-lg font-semibold",
                            corr.correlation >= 0
                              ? "text-emerald-700"
                              : "text-red-700",
                          )}
                        >
                          {corr.correlation >= 0 ? "+" : ""}
                          {corr.correlation.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        {/* At-Risk Students Tab */}
        <Tabs.Content value="at-risk" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-600" />
                Students Requiring Intervention
              </CardTitle>
              <CardDescription>
                Students identified as high-risk based on predictive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highRiskStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p>No high-risk students identified</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highRiskStudents.map((prediction) => {
                    const student = students.find(
                      (s) => s.id === prediction.studentId,
                    );
                    if (!student) return null;

                    return (
                      <div
                        key={prediction.studentId}
                        className={cn(
                          "p-4 rounded-lg",
                          "border border-red-200",
                          "bg-red-50",
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[hsl(222.2,47.4%,11.2%)]">
                                Student {student.id}
                              </span>
                              <Badge variant="danger">High Risk</Badge>
                            </div>
                            <p className="mt-1 text-sm text-[hsl(240,3.8%,46.1%)]">
                              Predicted Grade:{" "}
                              {GRADE_LABELS[prediction.predictedGrade]}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-500">
                              GPA: {student.gpa.toFixed(2)}
                            </span>
                            <span className="text-slate-500">
                              Absences: {student.absences}
                            </span>
                            <span className="text-slate-500">
                              Study: {student.studyTimeWeekly}h/week
                            </span>
                          </div>
                        </div>

                        {prediction.keyFactors.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-xs font-medium text-[hsl(240,3.8%,46.1%)] mb-2">
                              Contributing Factors:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {prediction.keyFactors.map((factor, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "text-xs px-2 py-1 rounded",
                                    factor.impact === "negative"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-[hsl(210,40%,96.1%)] text-[hsl(222.2,47.4%,11.2%)]",
                                  )}
                                >
                                  {factor.feature}: {factor.description}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
