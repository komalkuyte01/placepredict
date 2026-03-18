import type { CandidateProfile } from "@/lib/types/placement";

/** Returns a default empty candidate profile with sensible initial values. */
export function createEmptyProfile(): CandidateProfile {
  return {
    academic: {
      cgpa: 7.0,
      backlogs: 0,
      tenthPercentage: 75,
      twelfthPercentage: 75,
      degreeBranch: "Computer Science",
    },
    technical: {
      technicalSkills: [],
      dsaLevel: "Basic",
      projectsCount: 0,
      hasInternship: false,
      certifications: [],
    },
    experience: {
      hackathonsCount: 0,
      hasOpenSourceContributions: false,
      resumeATSScore: 50,
    },
    softSkills: {
      aptitudeScore: 50,
      communicationScore: 5,
      mockInterviewScore: 5,
      englishFluency: 5,
    },
  };
}
