import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, AppError } from '../utils/response.utils.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(),
  ]);

  sendSuccess(
    res,
    {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Users retrieved successfully.'
  );
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  sendSuccess(res, null, 'User deleted successfully.');
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find().skip(skip).limit(limit).sort({ postedAt: -1 }).lean(),
    Job.countDocuments(),
  ]);

  sendSuccess(
    res,
    {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Jobs retrieved successfully.'
  );
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    throw new AppError('Job not found.', 404);
  }

  sendSuccess(res, null, 'Job deleted successfully.');
});

export const getAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const [totalUsers, totalJobs, totalApplications, jobsBySource] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
        Job.aggregate<{ _id: string; count: number }>([
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    const formattedJobsBySource = jobsBySource.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item._id || 'unknown'] = item.count;
        return acc;
      },
      {}
    );

    sendSuccess(
      res,
      {
        totalUsers,
        totalJobs,
        totalApplications,
        jobsBySource: formattedJobsBySource,
      },
      'Analytics retrieved successfully.'
    );
  }
);

export const triggerJobFetch = asyncHandler(
  async (_req: Request, res: Response) => {
    const { aggregateJobs } = await import(
      '../jobs/jobAggregator.cron.js'
    );

    await aggregateJobs();

    sendSuccess(res, null, 'Job fetch triggered successfully.');
  }
);
