"use client";

import { useState } from "react";
import { LandingPage } from "@/components/landing/landing-page";
import { PlacementDashboard } from "@/components/dashboard/placement-dashboard";

/**
 * Home page component.
 * Shows landing page first, then navigates to dashboard based on user selection.
 */
export default function HomePage() {
  const [view, setView] = useState<"landing" | "upload" | "manual">("landing");

  if (view === "landing") {
    return <LandingPage onSelectOption={(option) => setView(option)} />;
  }

  return <PlacementDashboard initialMode={view} onBack={() => setView("landing")} />;
}
