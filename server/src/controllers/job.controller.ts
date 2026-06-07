import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.utils.js';
import { jobService } from '../services/job.service.js';

interface JobQueryFilters {
  search?: string;
  location?: string;
  type?: string;
  source?: string;
  page?: string;
  limit?: string;
}

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as JobQueryFilters;
  const result = await jobService.getJobs(filters as any);
  sendSuccess(res, result, 'Jobs retrieved successfully.');
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJobById(req.params.id as string);
  sendSuccess(res, job, 'Job retrieved successfully.');
});

export const saveJob = asyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.saveJob(req.user.userId, req.params.id as string);
  sendSuccess(res, result, 'Job saved successfully.', 201);
});

export const unsaveJob = asyncHandler(async (req: Request, res: Response) => {
  const result = await jobService.unsaveJob(req.user.userId, req.params.id as string);
  sendSuccess(res, result, 'Job unsaved successfully.');
});

export const getSavedJobs = asyncHandler(
  async (req: Request, res: Response) => {
    const savedJobs = await jobService.getSavedJobs(req.user.userId);
    sendSuccess(res, savedJobs, 'Saved jobs retrieved successfully.');
  }
);
