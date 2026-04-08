"use client";

import { AlertCircle, FileCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";

export function ATSModal({ color = "#10b981" }: { color?: string }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = useCallback(async () => {
    if (!resumeFile) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const response = await fetch("/api/ats-score", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("atsSettings", JSON.stringify(data.result));
        router.push("/ats-score");
      } else {
        const errText = await response.text();
        let errMsg = errText;
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errText;
        } catch {
          // ignore
        }
        setErrorMsg(errMsg);
      }
    } catch {
      setErrorMsg("Failed to analyze. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeFile, router]);

  return (
    <div className="flex flex-col">
      <FileUploadZone
        label="Your Resume"
        file={resumeFile}
        onFileChange={(file) => {
          setResumeFile(file);
          setErrorMsg(null);
        }}
        hint="PDF file up to 5MB"
      />

      <div className="mt-8 flex flex-col items-center">
        {errorMsg && (
          <div className="w-full max-w-md mb-4 text-red-600 text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || !resumeFile}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-white"
          style={{
            backgroundColor: isLoading || !resumeFile ? undefined : color,
          }}
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
      </div>
    </div>
  );
}
