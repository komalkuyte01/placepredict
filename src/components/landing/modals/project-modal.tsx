"use client";

import { FolderKanban, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";

export function ProjectModal() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = useCallback(async () => {
    if (!projectDescription.trim()) return;
    setIsLoading(true);

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
          _projectName: projectName, // inject project name for the results page
        };
        sessionStorage.setItem("projectSettings", JSON.stringify(payload));
        router.push("/project-assessment");
      } else {
        alert("Assessment failed. Please try again.");
      }
    } catch {
      alert("Failed to assess. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projectName, projectDescription, techStack, router]);

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
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 transition-all"
            placeholder="e.g., Real-time Chat Application"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="project-description"
            className="block text-sm font-semibold text-gray-900"
          >
            Project Description <span className="text-[#1360fa]">*</span>
          </label>
          <textarea
            id="project-description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe what the project does, features implemented, architecture, challenges solved..."
            rows={5}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 resize-none transition-all"
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
            onChange={(e) => setTechStack(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1360fa]/40 focus:ring-2 focus:ring-[#1360fa]/10 transition-all"
            placeholder="e.g., React, Node.js, MongoDB, Docker"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || !projectDescription.trim()}
          className={cn(
            "w-full px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl",
            isLoading || !projectDescription.trim()
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#1360fa] text-white hover:bg-[#5c35e6] shadow-[#1360fa]/25 hover:shadow-[#1360fa]/30",
          )}
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
        <p className="text-xs text-gray-400 mt-4 text-center">
          Analysis is entirely private and not used for training.
        </p>
      </div>
    </div>
  );
}
