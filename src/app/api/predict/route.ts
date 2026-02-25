import { NextResponse } from "next/server";
import {
    predictPlacement,
    SOFTWARE_DEVELOPER_CRITERIA,
} from "@/lib/ml/placement-ml-engine";
import type { CandidateProfile } from "@/lib/types/placement";

export const dynamic = "force-dynamic";

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
        return NextResponse.json(
            { error: "Failed to run prediction" },
            { status: 500 },
        );
    }
}
