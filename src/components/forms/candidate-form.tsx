"use client";

import {
  Briefcase,
  Code,
  GraduationCap,
  Loader2,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CandidateProfile,
  DegreeBranch,
  DSALevel,
} from "@/lib/types/placement";
import { cn } from "@/lib/utils/cn";

interface CandidateFormProps {
  profile: CandidateProfile;
  onProfileChange: (profile: CandidateProfile) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

/**
 * Form for entering candidate details for ML prediction.
 */
export function CandidateForm({
  profile,
  onProfileChange,
  onSubmit,
  isLoading = false,
}: CandidateFormProps) {
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");

  const updateAcademic = <K extends keyof CandidateProfile["academic"]>(
    key: K,
    value: CandidateProfile["academic"][K],
  ) => {
    onProfileChange({
      ...profile,
      academic: { ...profile.academic, [key]: value },
    });
  };

  const updateTechnical = <K extends keyof CandidateProfile["technical"]>(
    key: K,
    value: CandidateProfile["technical"][K],
  ) => {
    onProfileChange({
      ...profile,
      technical: { ...profile.technical, [key]: value },
    });
  };

  const updateExperience = <K extends keyof CandidateProfile["experience"]>(
    key: K,
    value: CandidateProfile["experience"][K],
  ) => {
    onProfileChange({
      ...profile,
      experience: { ...profile.experience, [key]: value },
    });
  };

  const updateSoftSkills = <K extends keyof CandidateProfile["softSkills"]>(
    key: K,
    value: CandidateProfile["softSkills"][K],
  ) => {
    onProfileChange({
      ...profile,
      softSkills: { ...profile.softSkills, [key]: value },
    });
  };

  const addTechnicalSkill = () => {
    if (
      newSkill.trim() &&
      !profile.technical.technicalSkills.includes(newSkill.trim())
    ) {
      updateTechnical("technicalSkills", [
        ...profile.technical.technicalSkills,
        newSkill.trim(),
      ]);
      setNewSkill("");
    }
  };

  const removeTechnicalSkill = (skill: string) => {
    updateTechnical(
      "technicalSkills",
      profile.technical.technicalSkills.filter((s) => s !== skill),
    );
  };

  const addCertification = () => {
    if (
      newCert.trim() &&
      !profile.technical.certifications.includes(newCert.trim())
    ) {
      updateTechnical("certifications", [
        ...profile.technical.certifications,
        newCert.trim(),
      ]);
      setNewCert("");
    }
  };

  const removeCertification = (cert: string) => {
    updateTechnical(
      "certifications",
      profile.technical.certifications.filter((c) => c !== cert),
    );
  };

  return (
    <div className="space-y-8">
      {/* Academic Section */}
      <FormSection
        icon={<GraduationCap className="w-5 h-5" />}
        title="Academic Information"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="CGPA (0-10)">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={profile.academic.cgpa ?? ""}
              onChange={(e) =>
                updateAcademic(
                  "cgpa",
                  e.target.value === ""
                    ? undefined
                    : parseFloat(e.target.value),
                )
              }
              className="w-full"
              placeholder="Enter CGPA"
            />
          </FormField>

          <FormField label="Active Backlogs">
            <input
              type="number"
              min="0"
              max="20"
              value={profile.academic.backlogs ?? ""}
              onChange={(e) =>
                updateAcademic(
                  "backlogs",
                  e.target.value === "" ? undefined : parseInt(e.target.value),
                )
              }
              className="w-full"
              placeholder="Enter backlogs count"
            />
          </FormField>

          <FormField label="10th Percentage">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={profile.academic.tenthPercentage ?? ""}
              onChange={(e) =>
                updateAcademic(
                  "tenthPercentage",
                  e.target.value === ""
                    ? undefined
                    : parseFloat(e.target.value),
                )
              }
              className="w-full"
              placeholder="Enter 10th percentage"
            />
          </FormField>

          <FormField label="12th Percentage">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={profile.academic.twelfthPercentage ?? ""}
              onChange={(e) =>
                updateAcademic(
                  "twelfthPercentage",
                  e.target.value === ""
                    ? undefined
                    : parseFloat(e.target.value),
                )
              }
              className="w-full"
              placeholder="Enter 12th percentage"
            />
          </FormField>

          <FormField label="Degree Branch">
            <Select
              value={profile.academic.degreeBranch}
              onValueChange={(value) =>
                updateAcademic("degreeBranch", value as DegreeBranch)
              }
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">
                  Computer Science
                </SelectItem>
                <SelectItem value="Information Technology">
                  Information Technology
                </SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormSection>

      {/* Technical Skills Section */}
      <FormSection icon={<Code className="w-5 h-5" />} title="Technical Skills">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Technical Skills">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTechnicalSkill()}
                  className="flex-1 min-w-0"
                  placeholder="e.g., Python, React, AWS, Docker"
                />
                <button
                  type="button"
                  onClick={addTechnicalSkill}
                  className="flex-shrink-0 px-3 py-2 bg-[#6e44ff] text-white rounded-lg hover:bg-[#5c35e6]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.technical.technicalSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#6e44ff]/10 text-[#6e44ff] rounded-lg text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeTechnicalSkill(skill)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Added: {profile.technical.technicalSkills.length} skills
                (languages, frameworks, tools, etc.)
              </p>
            </div>
          </FormField>

          <FormField label="DSA Level">
            <Select
              value={profile.technical.dsaLevel}
              onValueChange={(value) =>
                updateTechnical("dsaLevel", value as DSALevel)
              }
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select DSA level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Basic">
                  Basic (Arrays, Strings, Sorting)
                </SelectItem>
                <SelectItem value="Intermediate">
                  Intermediate (Trees, Graphs, DP)
                </SelectItem>
                <SelectItem value="Advanced">
                  Advanced (DP, Segment Trees)
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Projects Count">
            <input
              type="number"
              min="0"
              max="20"
              value={profile.technical.projectsCount ?? ""}
              onChange={(e) =>
                updateTechnical(
                  "projectsCount",
                  e.target.value === "" ? undefined : parseInt(e.target.value),
                )
              }
              className="w-full"
              placeholder="Enter projects count"
            />
          </FormField>

          <FormField label="Certifications">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCertification()}
                  className="flex-1 min-w-0"
                  placeholder="e.g., AWS Certified, Google Cloud"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex-shrink-0 px-3 py-2 bg-[#6e44ff] text-white rounded-lg hover:bg-[#5c35e6]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.technical.certifications.map((cert, index) => (
                  <span
                    key={`${cert}-${index}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Added: {profile.technical.certifications.length} certifications
              </p>
            </div>
          </FormField>

          <FormField label="Has Internship Experience">
            <div className="flex items-center gap-3 h-10">
              <input
                type="checkbox"
                id="hasInternship"
                checked={profile.technical.hasInternship}
                onChange={(e) =>
                  updateTechnical("hasInternship", e.target.checked)
                }
              />
              <label
                htmlFor="hasInternship"
                className="text-sm text-[hsl(240,3.8%,46.1%)]"
              >
                Yes, I have completed at least one internship
              </label>
            </div>
          </FormField>
        </div>
      </FormSection>

      {/* Experience Section */}
      <FormSection
        icon={<Briefcase className="w-5 h-5" />}
        title="Experience & Exposure"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Hackathons Participated">
            <input
              type="number"
              min="0"
              max="20"
              value={profile.experience.hackathonsCount ?? ""}
              onChange={(e) =>
                updateExperience(
                  "hackathonsCount",
                  e.target.value === "" ? undefined : parseInt(e.target.value),
                )
              }
              className="w-full"
              placeholder="Enter hackathons count"
            />
          </FormField>

          <FormField label="Open Source Contributions">
            <div className="flex items-center gap-3 h-10">
              <input
                type="checkbox"
                id="hasOpenSource"
                checked={profile.experience.hasOpenSourceContributions}
                onChange={(e) =>
                  updateExperience(
                    "hasOpenSourceContributions",
                    e.target.checked,
                  )
                }
              />
              <label
                htmlFor="hasOpenSource"
                className="text-sm text-[hsl(240,3.8%,46.1%)]"
              >
                Yes, I have contributed to open source
              </label>
            </div>
          </FormField>

          <FormField label="Resume ATS Score (0-100)">
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={profile.experience.resumeATSScore}
                onChange={(e) =>
                  updateExperience("resumeATSScore", parseInt(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor</span>
                <span className="font-medium">
                  {profile.experience.resumeATSScore}
                </span>
                <span>Excellent</span>
              </div>
              <p className="text-xs text-gray-400">
                Auto-calculated by AI if resume is uploaded
              </p>
            </div>
          </FormField>
        </div>
      </FormSection>

      {/* Soft Skills Section */}
      <FormSection
        icon={<MessageSquare className="w-5 h-5" />}
        title="Soft Skills & Assessments"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Aptitude Test Score (0-100)">
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={profile.softSkills.aptitudeScore}
                onChange={(e) =>
                  updateSoftSkills("aptitudeScore", parseInt(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span className="font-medium">
                  {profile.softSkills.aptitudeScore}%
                </span>
                <span>100</span>
              </div>
            </div>
          </FormField>

          <FormField label="Communication Score (1-10)">
            <ScoreSlider
              value={profile.softSkills.communicationScore}
              onChange={(v) => updateSoftSkills("communicationScore", v)}
              label="Rate your verbal communication skills"
            />
          </FormField>

          <FormField label="Mock Interview Score (1-10)">
            <ScoreSlider
              value={profile.softSkills.mockInterviewScore}
              onChange={(v) => updateSoftSkills("mockInterviewScore", v)}
              label="Rate based on mock interview feedback"
            />
          </FormField>

          <FormField label="English Fluency (1-10)">
            <ScoreSlider
              value={profile.softSkills.englishFluency}
              onChange={(v) => updateSoftSkills("englishFluency", v)}
              label="Rate your English speaking/writing ability"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 rounded-lg font-semibold",
            "bg-[hsl(240,5.9%,10%)]",
            "text-white",
            "hover:bg-[hsl(240,5.9%,20%)]",
            "transition-colors",
            "disabled:opacity-70 disabled:cursor-not-allowed",
            "flex items-center gap-2",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>🤖 Run ML Prediction</>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Form section wrapper.
 */
interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function FormSection({ icon, title, children }: FormSectionProps) {
  return (
    <section className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(240,10%,3.9%)]">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Form field wrapper.
 */
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[hsl(240,10%,3.9%)]">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Score slider for 1-10 ratings.
 */
interface ScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function ScoreSlider({ value, onChange, label }: ScoreSliderProps) {
  return (
    <div className="space-y-2">
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-[hsl(240,3.8%,46.1%)]">
        <span>1</span>
        <span className="font-medium text-[hsl(240,10%,3.9%)]">{value}/10</span>
        <span>10</span>
      </div>
      <p className="text-xs text-[hsl(240,3.8%,60%)]">{label}</p>
    </div>
  );
}
