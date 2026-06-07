import jobRepository from '../repositories/job.repository.js';
import { AppError } from '../utils/response.utils.js';
import { IJob } from '../models/Job.model.js';
import SavedJob from '../models/SavedJob.model.js';
import { logger } from '../config/logger.js';
import mongoose from 'mongoose';
import { notificationService } from './notification.service.js';

export interface JobFilters {
  search?: string;
  location?: string;
  company?: string;
  source?: 'greenhouse' | 'lever' | 'ashby';
  employmentType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedJobs {
  jobs: IJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SavedJobDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId: string | IJob | mongoose.Types.ObjectId;
  savedAt: Date;
}

export const jobService = {
  async getJobs(filters: JobFilters): Promise<PaginatedJobs> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const { jobs, total } = await jobRepository.findWithFilters({
      search: filters.search,
      location: filters.location,
      company: filters.company,
      source: filters.source,
      employmentType: filters.employmentType,
      page,
      limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getJobById(id: string): Promise<IJob> {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    return job;
  },

  async saveJob(userId: string, jobId: string): Promise<SavedJobDocument> {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    const existing = await SavedJob.findOne({ userId, jobId }).lean<SavedJobDocument>();
    if (existing) {
      throw new AppError('Job already saved', 409);
    }

    const savedJob = await SavedJob.create({
      userId,
      jobId,
      savedAt: new Date(),
    });

    await notificationService.createNotification({
      userId,
      type: 'new_job',
      message: `You saved a job: ${job.title} at ${job.company}`,
      metadata: {
        jobId: savedJob._id.toString(),
        applyUrl: job.applyUrl,
      },
    });

    logger.info(`User ${userId} saved job ${jobId}`);
    return savedJob.toObject() as unknown as SavedJobDocument;
  },

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const result = await SavedJob.findOneAndDelete({ userId, jobId });
    if (!result) {
      throw new AppError('Saved job not found', 404);
    }

    logger.info(`User ${userId} unsaved job ${jobId}`);
  },

  async getSavedJobs(userId: string): Promise<SavedJobDocument[]> {
    const savedJobs = await SavedJob.find({ userId })
      .populate<{ jobId: IJob }>('jobId')
      .sort({ savedAt: -1 })
      .lean<SavedJobDocument[]>();

    return savedJobs;
  },
};
