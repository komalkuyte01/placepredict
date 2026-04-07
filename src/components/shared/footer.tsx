"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  showDisclaimer?: boolean;
}

export function Footer({
  showDisclaimer: _showDisclaimer = false,
}: FooterProps) {
  return (
    <footer className="bg-gray-900 pt-10 pb-8 relative overflow-hidden mt-10">
      {/* Decorative Atmospheric Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#1360fa]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 w-full border-b border-gray-800 mb-6 pb-10">
          {/* Brand column */}
          <div className="max-w-sm lg:max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#1360fa] flex items-center justify-center shadow-lg shadow-[#1360fa]/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white text-lg tracking-tight">
                PlacePredict
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering students with AI-driven placement predictions,
              personalized resume insights, and data-backed career guidance to
              secure their dream jobs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm tracking-wide uppercase">
              Core Tools
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/#tools"
                  className="hover:text-white transition-colors"
                >
                  Placement Prediction
                </Link>
              </li>
              <li>
                <Link
                  href="/#tools"
                  className="hover:text-white transition-colors"
                >
                  Job Description Matching
                </Link>
              </li>
              <li>
                <Link
                  href="/#tools"
                  className="hover:text-white transition-colors"
                >
                  Resume ATS Scoring
                </Link>
              </li>
              <li>
                <Link
                  href="/#tools"
                  className="hover:text-white transition-colors"
                >
                  Project Assessment
                </Link>
              </li>
              <li>
                <Link
                  href="/#tools"
                  className="hover:text-white transition-colors"
                >
                  Resume Comparison
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm tracking-wide uppercase">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} PlacePredict. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
