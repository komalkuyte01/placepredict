import { NextResponse } from "next/server";
import {
  predictPlacement,
  SOFTWARE_DEVELOPER_CRITERIA,
} from "@/lib/ml/placement-ml-engine";
import type { CandidateProfile } from "@/lib/types/placement";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/predict
 * Runs ML placement prediction on the server so the browser stays responsive.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile: CandidateProfile = body.profile;

    if (!profile) {
      return NextResponse.json(
        { error: "Profile data is required" },
        { status: 400 },
      );
    }

    const prediction = predictPlacement(profile, SOFTWARE_DEVELOPER_CRITERIA);

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error("Prediction error:", error);
    const detail =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;
    return NextResponse.json(
      {
        error: "Failed to run prediction",
        ...(detail ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
