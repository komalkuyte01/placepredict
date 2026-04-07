"use client";

import { AlertCircle, FileDiff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";

export function CompareModal({ color = "#ec4899" }: { color?: string }) {
  const [resumeA, setResumeA] = useState<File | null>(null);
  const [resumeB, setResumeB] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleCompare = useCallback(async () => {
    if (!resumeA || !resumeB) return;
    setIsLoading(true);
    setErrorMsg(null);

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
      setErrorMsg("Failed to compare. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resumeA, resumeB, router]);

  const isDisabled = isLoading || !resumeA || !resumeB;

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 gap-4">
        <FileUploadZone
          label="Resume Version A"
          file={resumeA}
          onFileChange={(val) => {
            setResumeA(val);
            setErrorMsg(null);
          }}
          hint="PDF file up to 5MB"
        />
        <FileUploadZone
          label="Resume Version B"
          file={resumeB}
          onFileChange={(val) => {
            setResumeB(val);
            setErrorMsg(null);
          }}
          hint="PDF file up to 5MB"
        />
      </div>

      <div className="mt-8 flex flex-col items-center">
        {errorMsg && (
          <div className="w-full max-w-md mb-4 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleCompare}
          disabled={isDisabled}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-white"
          style={{
            backgroundColor: isDisabled ? undefined : color,
          }}
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
      </div>
    </div>
  );
}
