"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import type { DatasetStatistics, GradeClass } from "@/lib/types/student";
import { GRADE_LABELS } from "@/lib/types/student";

/**
 * Color palette for charts - calm academic tones.
 */
const CHART_COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  tertiary: "#a855f7",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  slate: "#64748b",
};

/**
 * Grade-specific color mapping.
 */
const GRADE_COLORS: Record<GradeClass, string> = {
  0: "#10b981", // A - Green
  1: "#3b82f6", // B - Blue
  2: "#f59e0b", // C - Amber
  3: "#f97316", // D - Orange
  4: "#ef4444", // F - Red
};

/**
 * Props for the GradeDistributionChart component.
 */
interface GradeDistributionChartProps {
  /** Grade distribution data */
  distribution: Record<GradeClass, number>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Bar chart showing the distribution of grades across the dataset.
 */
export function GradeDistributionChart({
  distribution,
  className,
}: GradeDistributionChartProps) {
  const data = Object.entries(distribution).map(([grade, count]) => ({
    grade: GRADE_LABELS[Number(grade) as GradeClass].split(" ")[0],
    fullLabel: GRADE_LABELS[Number(grade) as GradeClass],
    count,
    fill: GRADE_COLORS[Number(grade) as GradeClass],
  }));

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="grade"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value, _name, props) => {
              const payload = props.payload as { fullLabel: string };
              return [value, payload.fullLabel];
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Props for the GenderDistributionChart component.
 */
interface GenderDistributionChartProps {
  /** Gender distribution data */
  distribution: Record<"Male" | "Female", number>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pie chart showing gender distribution.
 */
export function GenderDistributionChart({
  distribution,
  className,
}: GenderDistributionChartProps) {
  const data = [
    { name: "Male", value: distribution.Male, fill: CHART_COLORS.primary },
    {
      name: "Female",
      value: distribution.Female,
      fill: CHART_COLORS.secondary,
    },
  ];

  return (
    <div className={cn("w-full h-[250px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Props for the CorrelationChart component.
 */
interface CorrelationChartProps {
  /** Feature correlations data */
  correlations: DatasetStatistics["featureCorrelations"];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Horizontal bar chart showing feature correlations with GPA.
 */
export function CorrelationChart({
  correlations,
  className,
}: CorrelationChartProps) {
  const data = correlations.map((corr) => ({
    feature: corr.feature,
    correlation: corr.correlation,
    fill: corr.correlation >= 0 ? CHART_COLORS.success : CHART_COLORS.danger,
  }));

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            domain={[-1, 1]}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
            formatter={(value) => [
              typeof value === "number" ? value.toFixed(3) : value,
              "Correlation",
            ]}
          />
          <Bar dataKey="correlation" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Props for the RiskDistributionChart component.
 */
interface RiskDistributionChartProps {
  /** Risk level counts */
  distribution: {
    low: number;
    medium: number;
    high: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pie chart showing risk level distribution.
 */
export function RiskDistributionChart({
  distribution,
  className,
}: RiskDistributionChartProps) {
  const data = [
    { name: "Low Risk", value: distribution.low, fill: CHART_COLORS.success },
    {
      name: "Medium Risk",
      value: distribution.medium,
      fill: CHART_COLORS.warning,
    },
    { name: "High Risk", value: distribution.high, fill: CHART_COLORS.danger },
  ];

  return (
    <div className={cn("w-full h-[250px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Props for the PerformanceRadarChart component.
 */
interface PerformanceRadarChartProps {
  /** Performance metrics */
  metrics: {
    studyTime: number;
    attendance: number;
    gpa: number;
    engagement: number;
    support: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Radar chart for visualizing multi-dimensional performance metrics.
 */
export function PerformanceRadarChart({
  metrics,
  className,
}: PerformanceRadarChartProps) {
  const data = [
    { subject: "Study Time", value: metrics.studyTime, fullMark: 100 },
    { subject: "Attendance", value: metrics.attendance, fullMark: 100 },
    { subject: "GPA", value: metrics.gpa, fullMark: 100 },
    { subject: "Engagement", value: metrics.engagement, fullMark: 100 },
    { subject: "Support", value: metrics.support, fullMark: 100 },
  ];

  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Props for the StudyTimeDistributionChart component.
 */
interface StudyTimeDistributionChartProps {
  /** Study time values */
  studyTimes: number[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Area chart showing study time distribution.
 */
export function StudyTimeDistributionChart({
  studyTimes,
  className,
}: StudyTimeDistributionChartProps) {
  // Create histogram bins
  const bins = new Map<number, number>();
  for (const time of studyTimes) {
    const bin = Math.floor(time / 5) * 5;
    bins.set(bin, (bins.get(bin) || 0) + 1);
  }

  const data = Array.from(bins.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hours, count]) => ({
      hours: `${hours}-${hours + 5}h`,
      count,
    }));

  return (
    <div className={cn("w-full h-[250px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="hours"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
