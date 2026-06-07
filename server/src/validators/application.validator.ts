import { z } from 'zod';

export const createApplicationSchema = z.object({
  jobId: z.string().trim().min(1, 'jobId is required'),
  company: z.string().trim().min(1, 'company is required'),
  position: z.string().trim().min(1, 'position is required'),
  status: z
    .enum(['Applied', 'Assessment', 'Interview', 'Rejected', 'Offer', 'Accepted'])
    .optional(),
  notes: z.string().trim().optional(),
  interviewDate: z.string().trim().optional(),
});

export const updateStatusSchema = z.object({
  status: z
    .enum(['Applied', 'Assessment', 'Interview', 'Rejected', 'Offer', 'Accepted']),
  note: z.string().trim().optional(),
});

export const updateNotesSchema = z.object({
  notes: z.string().trim().min(1, 'notes is required'),
});

export const setInterviewDateSchema = z.object({
  interviewDate: z.string().trim().min(1, 'interviewDate is required'),
});
