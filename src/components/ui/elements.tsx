import { cn } from "@/lib/utils/cn";
import type { ReactNode, ElementType, ComponentPropsWithoutRef } from "react";

/**
 * Badge variant options.
 */
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

/**
 * Props for the Badge component.
 */
interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Variant style mappings for badges.
 */
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
};

/**
 * Small status badge for labels and indicators.
 */
export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full",
        "text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Button variant options.
 */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/**
 * Button size options.
 */
type ButtonSize = "sm" | "md" | "lg";

/**
 * Base button props.
 */
interface ButtonBaseProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button content */
  children: ReactNode;
}

/**
 * Props for polymorphic button component.
 */
type ButtonProps<T extends ElementType = "button"> = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonBaseProps> & {
    as?: T;
  };

/**
 * Variant style mappings for buttons.
 */
const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-400",
};

/**
 * Size style mappings for buttons.
 */
const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Primary button component with variants.
 */
export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  disabled,
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";

  return (
    <Component
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "font-medium rounded-lg",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariantStyles[variant],
        buttonSizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Props for the StatCard component.
 */
interface StatCardProps {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional trend indicator */
  trend?: "up" | "down" | "neutral";
  /** Optional trend value */
  trendValue?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Statistics display card for dashboard metrics.
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
        "rounded-xl p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-200">
            {value}
          </p>

          {trend && trendValue && (
            <p
              className={cn(
                "mt-2 text-sm flex items-center gap-1",
                trend === "up" && "text-emerald-600 dark:text-emerald-400",
                trend === "down" && "text-red-600 dark:text-red-400",
                trend === "neutral" && "text-slate-500 dark:text-slate-400",
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </p>
          )}
        </div>

        {icon && (
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Props for the ProgressBar component.
 */
interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Optional label */
  label?: string;
  /** Visual variant */
  variant?: "default" | "success" | "warning" | "danger";
  /** Show percentage text */
  showValue?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Progress indicator bar.
 */
export function ProgressBar({
  value,
  label,
  variant = "default",
  showValue = false,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const barColors: Record<string, string> = {
    default: "bg-indigo-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {clampedValue.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            barColors[variant],
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
