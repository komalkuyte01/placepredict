"use client";

import { AlertCircle, FolderKanban, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function ProjectModal({ color = "#f59e0b" }: { color?: string }) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = useCallback(async () => {
    if (!projectDescription.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/project-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, projectDescription, techStack }),
      });
      if (response.ok) {
        const data = await response.json();
        const payload = {
          ...data.result,
          _projectName: projectName,
        };
        sessionStorage.setItem("projectSettings", JSON.stringify(payload));
        router.push("/project-assessment");
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
      setErrorMsg("Failed to assess. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projectName, projectDescription, techStack, router]);

  const isDisabled = isLoading || !projectDescription.trim();

  return (
    <div className="flex flex-col">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="project-name"
            className="block text-sm font-semibold text-gray-900"
          >
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setErrorMsg(null);
            }}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all"
            placeholder="e.g., Real-time Chat Application"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="project-description"
            className="block text-sm font-semibold text-gray-900"
          >
            Project Description <span style={{ color }}>*</span>
          </label>
          <textarea
            id="project-description"
            value={projectDescription}
            onChange={(e) => {
              setProjectDescription(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Describe what the project does, features implemented, architecture, challenges solved..."
            rows={5}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 resize-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="tech-stack"
            className="block text-sm font-semibold text-gray-900"
          >
            Tech Stack
          </label>
          <input
            id="tech-stack"
            type="text"
            value={techStack}
            onChange={(e) => {
              setTechStack(e.target.value);
              setErrorMsg(null);
            }}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all"
            placeholder="e.g., React, Node.js, MongoDB, Docker"
          />
        </div>
      </div>

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
          disabled={isDisabled}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-white"
          style={{
            backgroundColor: isDisabled ? undefined : color,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Assessing Project...
            </>
          ) : (
            <>
              <FolderKanban className="w-5 h-5" /> Assess Project
            </>
          )}
        </button>
      </div>
    </div>
  );
}
