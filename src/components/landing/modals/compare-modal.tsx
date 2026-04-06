"use client";

import { FileDiff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { cn } from "@/lib/utils/cn";

export function CompareModal() {
  const [resumeA, setResumeA] = useState<File | null>(null);
  const [resumeB, setResumeB] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCompare = useCallback(async () => {
    if (!resumeA || !resumeB) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("resumeA", resumeA);
      formData.append("resumeB", resumeB);

      const response = await fetch("/api/resume-comparison", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("compareSettings", JSON.stringify(data.result));
        router.push("/resume-comparison");
      } else {
        alert("Comparison failed. Please try again.");
      }
    } catch {
      alert("Failed to compare. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeA, resumeB, router]);

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 gap-6">
        <FileUploadZone
          label="Resume Version A"
          file={resumeA}
          onFileChange={setResumeA}
          hint="PDF file up to 5MB"
        />
        <FileUploadZone
          label="Resume Version B"
          file={resumeB}
          onFileChange={setResumeB}
          hint="PDF file up to 5MB"
        />
      </div>

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={handleCompare}
          disabled={isLoading || !resumeA || !resumeB}
          className={cn(
            "w-full px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
            isLoading || !resumeA || !resumeB
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Comparing Versions...
            </>
          ) : (
            <>
              <FileDiff className="w-5 h-5" /> Compare Versions
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Analysis happens locally for maximum privacy.
        </p>
      </div>
    </div>
  );
}
