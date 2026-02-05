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
  default: "bg-[hsl(210,40%,96.1%)] text-[hsl(222.2,47.4%,11.2%)]",
  success:
    "bg-emerald-100 text-emerald-700",
  warning:
    "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-indigo-100 text-indigo-700",
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
    "bg-[hsl(210,40%,96.1%)] text-[hsl(222.2,47.4%,11.2%)] hover:bg-[hsl(214.3,31.8%,91.4%)] active:bg-[hsl(214.3,31.8%,86%)]",
  ghost:
    "bg-transparent text-[hsl(240,3.8%,46.1%)] hover:bg-[hsl(210,40%,96.1%)]",
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
        "bg-white",
        "border border-[hsl(214.3,31.8%,91.4%)]",
        "rounded-xl p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[hsl(240,3.8%,46.1%)]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-[hsl(222.2,47.4%,11.2%)]">
            {value}
          </p>

          {trend && trendValue && (
            <p
              className={cn(
                "mt-2 text-sm flex items-center gap-1",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-600",
                trend === "neutral" && "text-[hsl(240,3.8%,46.1%)]",
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </p>
          )}
        </div>

        {icon && (
          <div className="p-2.5 bg-[hsl(210,40%,96.1%)] rounded-lg">
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
            <span className="text-sm font-medium text-[hsl(222.2,47.4%,11.2%)]">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-[hsl(240,3.8%,46.1%)]">
              {clampedValue.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-[hsl(214.3,31.8%,91.4%)] rounded-full overflow-hidden">
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
