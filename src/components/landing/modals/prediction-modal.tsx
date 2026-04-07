"use client";

import { Loader2, PenLine, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { createEmptyProfile } from "@/lib/ml/default-profile";
import type {
  CandidateProfile,
  ResumeParseResult,
} from "@/lib/types/placement";

export function PredictionModal({ color = "#1360fa" }: { color?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleManualEntry = () => {
    sessionStorage.setItem(
      "predictionInitialState",
      JSON.stringify({
        mode: "manual",
        profile: createEmptyProfile(),
        parseResult: null,
      }),
    );
    router.push("/prediction");
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          alert(
            `Resume parsing failed (HTTP ${response.status}):\n${errorText}`,
          );
          return;
        }

        const result: ResumeParseResult = await response.json();

        if (result.success && result.extractedData) {
          const baseProfile = createEmptyProfile();
          const newProfile: CandidateProfile = { ...baseProfile };

          if (result.extractedData.academic) {
            const academic = result.extractedData.academic;
            newProfile.academic = {
              ...baseProfile.academic,
              ...(academic.cgpa && academic.cgpa > 0
                ? { cgpa: academic.cgpa }
                : {}),
              ...(academic.tenthPercentage && academic.tenthPercentage > 0
                ? { tenthPercentage: academic.tenthPercentage }
                : {}),
              ...(academic.twelfthPercentage && academic.twelfthPercentage > 0
                ? { twelfthPercentage: academic.twelfthPercentage }
                : {}),
              ...(academic.degreeBranch
                ? { degreeBranch: academic.degreeBranch }
                : {}),
              ...(academic.backlogs !== undefined
                ? { backlogs: academic.backlogs }
                : {}),
            };
          }

          if (result.extractedData.technical) {
            const tech = result.extractedData.technical;
            newProfile.technical = {
              ...baseProfile.technical,
              technicalSkills:
                tech.technicalSkills?.length > 0
                  ? tech.technicalSkills
                  : baseProfile.technical.technicalSkills,
              dsaLevel:
                tech.dsaLevel && tech.dsaLevel !== "None"
                  ? tech.dsaLevel
                  : baseProfile.technical.dsaLevel,
              projectsCount:
                (tech.projectsCount ?? 0) > 0
                  ? tech.projectsCount
                  : baseProfile.technical.projectsCount,
              hasInternship:
                tech.hasInternship || baseProfile.technical.hasInternship,
              certifications:
                tech.certifications?.length > 0
                  ? tech.certifications
                  : baseProfile.technical.certifications,
            };
          }

          if (result.extractedData.experience) {
            const exp = result.extractedData.experience;
            newProfile.experience = {
              ...baseProfile.experience,
              hackathonsCount:
                (exp.hackathonsCount ?? 0) > 0
                  ? exp.hackathonsCount
                  : baseProfile.experience.hackathonsCount,
              hasOpenSourceContributions:
                exp.hasOpenSourceContributions ||
                baseProfile.experience.hasOpenSourceContributions,
              resumeATSScore:
                exp.resumeATSScore > 0
                  ? exp.resumeATSScore
                  : baseProfile.experience.resumeATSScore,
            };
          }

          sessionStorage.setItem(
            "predictionInitialState",
            JSON.stringify({
              mode: "upload",
              profile: newProfile,
              parseResult: result,
            }),
          );
          router.push("/prediction");
        } else {
          const warnings = result.warnings?.join("\n") || "";
          const missing = result.missingFields?.join(", ") || "";
          alert(
            `Resume parsing failed.\n\n${warnings ? `Reason: ${warnings}\n` : ""}${missing ? `Missing: ${missing}` : ""}`,
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        alert(`Resume parsing error:\n${message}`);
      } finally {
        setIsUploading(false);
      }
    },
    [router],
  );

  return (
    <div className="flex flex-col space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color }} />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Parsing Resume
            </h3>
            <p className="text-sm text-gray-500">
              AI is extracting your details...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg"
              style={{ backgroundColor: color }}
            >
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Upload Resume
            </h3>
            <p className="text-sm text-gray-500">
              AI extracts your details automatically
            </p>
          </button>
          <button
            type="button"
            onClick={handleManualEntry}
            className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4 shadow-lg shadow-gray-900/20">
              <PenLine className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Enter Manually
            </h3>
            <p className="text-sm text-gray-500">
              Fill in your details manually
            </p>
          </button>
        </div>
      )}
    </div>
  );
}
