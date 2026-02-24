"use client";

import { useState } from "react";
import { LandingPage } from "@/components/landing/landing-page";
import { PlacementDashboard } from "@/components/dashboard/placement-dashboard";
import type { CandidateProfile, ResumeParseResult } from "@/lib/types/placement";

/**
 * Home page component.
 * Shows landing page first, then navigates to dashboard based on user selection.
 */
export default function HomePage() {
  const [view, setView] = useState<"landing" | "upload" | "manual">("landing");
  const [parsedProfile, setParsedProfile] = useState<CandidateProfile | null>(null);
  const [parseResult, setParseResult] = useState<ResumeParseResult | null>(null);

  const handleResumeUploaded = (profile: CandidateProfile, result: ResumeParseResult) => {
    setParsedProfile(profile);
    setParseResult(result);
    setView("upload");
  };

  const handleBack = () => {
    setView("landing");
    setParsedProfile(null);
    setParseResult(null);
  };

  if (view === "landing") {
    return (
      <LandingPage 
        onSelectOption={(option) => setView(option)} 
        onResumeUploaded={handleResumeUploaded}
      />
    );
  }

  return (
    <PlacementDashboard 
      initialMode={view} 
      onBack={handleBack}
      initialProfile={parsedProfile}
      initialParseResult={parseResult}
    />
  );
}
