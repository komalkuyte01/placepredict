"use client";

import { FileSearch, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";

export function JDMatchModal({ color = "#06b6d4" }: { color?: string }) {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = useCallback(async () => {
    if ((!jdFile && !jdText.trim()) || !resumeFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (jdFile) formData.append("jd", jdFile);
      else formData.append("jdText", jdText);
      formData.append("resume", resumeFile);

      const response = await fetch("/api/jd-matching", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("jdSettings", JSON.stringify(data.result));
        router.push("/jd-matching");
      } else {
        const err = await response.text();
        alert(`Analysis failed: ${err}`);
      }
    } catch {
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [jdFile, jdText, resumeFile, router]);

  const isDisabled = isLoading || (!jdFile && !jdText.trim()) || !resumeFile;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-5">
        <FileUploadZone
          label="Job Description"
          file={jdFile}
          onFileChange={setJdFile}
          hint="PDF or paste text"
          allowText
          defaultMode="text"
          textValue={jdText}
          onTextChange={setJdText}
          textPlaceholder="Paste the job description here..."
        />
        <FileUploadZone
          label="Your Resume"
          file={resumeFile}
          onFileChange={setResumeFile}
          hint="PDF file up to 5MB"
        />
      </div>

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isDisabled}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-white"
          style={{
            backgroundColor: isDisabled ? undefined : color,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Match...
            </>
          ) : (
            <>
              <FileSearch className="w-5 h-5" /> Calculate Job Fit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
