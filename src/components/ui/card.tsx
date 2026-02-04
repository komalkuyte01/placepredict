import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/**
 * Props for the Card component.
 */
interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Base card container with consistent styling.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-800",
        "rounded-xl shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Props for the CardHeader component.
 */
interface CardHeaderProps {
  /** Header content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card header section with consistent padding.
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-slate-200 dark:border-slate-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Props for the CardTitle component.
 */
interface CardTitleProps {
  /** Title content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card title with consistent typography.
 */
export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-slate-800 dark:text-slate-200",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/**
 * Props for the CardDescription component.
 */
interface CardDescriptionProps {
  /** Description content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card description with muted styling.
 */
export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "mt-1 text-sm text-slate-500 dark:text-slate-400",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Props for the CardContent component.
 */
interface CardContentProps {
  /** Content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card content area with consistent padding.
 */
export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
