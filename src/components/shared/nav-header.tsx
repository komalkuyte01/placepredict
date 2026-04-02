"use client";

import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavHeaderProps {
  title: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
}

/**
 * Shared navigation header used across all tool pages.
 * Provides consistent branding, back navigation, and page title.
 */
export function NavHeader({
  title,
  icon,
  showBackButton = true,
  backHref = "/",
}: NavHeaderProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="p-2 -ml-2 mr-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#6e44ff]/10 flex items-center justify-center">
              {icon || (
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#6e44ff]" />
              )}
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-[#6e44ff] flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="hidden sm:inline font-medium">PlacePredict</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
