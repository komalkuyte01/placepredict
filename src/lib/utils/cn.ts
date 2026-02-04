import { type ClassValue, clsx } from "clsx";

/**
 * Combines class names using clsx for conditional class application.
 * @param inputs - Class values to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
