"use client";

import { AlertCircle, FileSearch, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FileUploadZone } from "@/components/shared/file-upload-zone";

export function JDMatchModal({ color = "#06b6d4" }: { color?: string }) {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = useCallback(async () => {
    if ((!jdFile && !jdText.trim()) || !resumeFile) return;
    setIsLoading(true);
    setErrorMsg(null);

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
  }, [jdFile, jdText, resumeFile, router]);

  const isDisabled = isLoading || (!jdFile && !jdText.trim()) || !resumeFile;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-5">
        <FileUploadZone
          label="Job Description"
          file={jdFile}
          onFileChange={(file) => {
            setJdFile(file);
            setErrorMsg(null);
          }}
          hint="PDF or paste text"
          allowText
          defaultMode="text"
          textValue={jdText}
          onTextChange={(text) => {
            setJdText(text);
            setErrorMsg(null);
          }}
          textPlaceholder="Paste the job description here..."
        />
        <FileUploadZone
          label="Your Resume"
          file={resumeFile}
          onFileChange={(file) => {
            setResumeFile(file);
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
