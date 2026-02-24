"use client";

import { GraduationCap } from "lucide-react";

interface FooterProps {
  showDisclaimer?: boolean;
}

export function Footer({ showDisclaimer = false }: FooterProps) {
  return (
    <footer className="py-8 sm:py-10 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6e44ff] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">PlacePredict</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">
              AI-driven placement predictions for students
            </p>
            {showDisclaimer && (
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ Disclaimer: This is a probabilistic model for guidance only.
              </p>
            )}
          </div>
          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} PlacePredict
          </div>
        </div>
      </div>
    </footer>
  );
}
