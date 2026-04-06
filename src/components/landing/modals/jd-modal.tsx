"use client";

import { FileSearch, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";
import { cn } from "@/lib/utils/cn";

export function JDMatchModal() {
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
        // Save to session storage
        sessionStorage.setItem("jdSettings", JSON.stringify(data.result));
        // Redirect to results
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

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 gap-6">
        <FileUploadZone
          label="Job Description"
          file={jdFile}
          onFileChange={setJdFile}
          hint="PDF or paste text"
          allowText
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
          disabled={isLoading || (!jdFile && !jdText.trim()) || !resumeFile}
          className={cn(
            "w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
            isLoading || (!jdFile && !jdText.trim()) || !resumeFile
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
          )}
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
        <p className="text-xs text-gray-400 mt-4 text-center">
          Analysis happens locally for maximum privacy.
        </p>
      </div>
    </div>
  );
}
