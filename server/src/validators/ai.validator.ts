import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  resumeText: z
    .string()
    .trim()
    .min(1, 'resumeText is required'),
  jobDescription: z
    .string()
    .trim()
    .min(1, 'jobDescription is required'),
});

export const extractSkillsSchema = z.object({
  resumeText: z
    .string()
    .trim()
    .min(1, 'resumeText is required'),
});

export const skillGapSchema = z.object({
  resumeSkills: z
    .array(z.string().trim().min(1, 'Skill cannot be empty'))
    .nonempty('resumeSkills must include at least one skill'),
  jobRequirements: z
    .array(z.string().trim().min(1, 'Requirement cannot be empty'))
    .nonempty('jobRequirements must include at least one requirement'),
});

export const interviewPrepSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(1, 'jobDescription is required'),
  resumeText: z
    .string()
    .trim()
    .min(1, 'resumeText is required'),
  companyName: z
    .string()
    .trim()
    .min(1, 'companyName is required'),
});
