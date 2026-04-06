"use client";

import { FileCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { cn } from "@/lib/utils/cn";

export function ATSModal() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = useCallback(async () => {
    if (!resumeFile) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const response = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        // Save to session storage
        sessionStorage.setItem("atsSettings", JSON.stringify(data.result));
        // Redirect to results
        router.push("/ats-score");
      } else {
        alert("Analysis failed. Please try again.");
      }
    } catch {
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeFile, router]);

  return (
    <div className="flex flex-col">
      <FileUploadZone
        label="Your Resume"
        file={resumeFile}
        onFileChange={setResumeFile}
        hint="PDF file up to 5MB"
      />

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || !resumeFile}
          className={cn(
            "w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
            isLoading || !resumeFile
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...
            </>
          ) : (
            <>
              <FileCheck className="w-5 h-5" /> Analyze ATS Score
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Files are processed locally and never stored permanently.
        </p>
      </div>
    </div>
  );
}
