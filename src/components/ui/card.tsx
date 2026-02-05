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
        "bg-white",
        "border border-[hsl(214.3,31.8%,91.4%)]",
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
        "px-6 py-4 border-b border-[hsl(214.3,31.8%,91.4%)]",
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
        "text-lg font-semibold text-[hsl(222.2,47.4%,11.2%)]",
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
        "mt-1 text-sm text-[hsl(240,3.8%,46.1%)]",
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
