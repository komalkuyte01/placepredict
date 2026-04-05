"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shared navigation header used across ALL pages.
 * Mirrors the landing page header for consistent branding.
 * On the landing page, nav links scroll to sections; on other pages, they navigate back.
 */
export function NavHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  // On landing page, use anchor links; on other pages, link back to landing sections
  const featuresHref = isLanding ? "#features" : "/#features";
  const toolsHref = isLanding ? "#tools" : "/#tools";
  const getStartedHref = isLanding ? "#get-started" : "/prediction";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#6e44ff] flex items-center justify-center shadow-lg shadow-[#6e44ff]/20">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              PlacePredict
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href={featuresHref}
              className="hidden sm:block text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href={toolsHref}
              className="hidden sm:block text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              Tools
            </Link>
            <Link
              href={getStartedHref}
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
