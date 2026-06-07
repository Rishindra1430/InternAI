import mongoose from 'mongoose';
import Job, { type IJobDocument } from '../models/Job.model.js';

export interface JobFilters {
  search?: string;
  location?: string;
  company?: string;
  employmentType?: string;
  isRemote?: boolean;
  source?: 'greenhouse' | 'lever' | 'ashby';
  skills?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  applyUrl: string;
  source: 'greenhouse' | 'lever' | 'ashby';
  isRemote: boolean;
  postedDate: Date;
  externalId: string;
}

export interface PaginatedJobs {
  jobs: IJobDocument[];
  total: number;
  page: number;
  totalPages: number;
}

interface SourceCount {
  _id: string;
  count: number;
}

const jobRepository = {
  async findWithFilters(filters: JobFilters): Promise<PaginatedJobs> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.isRemote !== undefined) {
      query.isRemote = filters.isRemote;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    const sortField = filters.sortBy ?? 'postedDate';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sortOptions).skip(skip).limit(limit).lean<IJobDocument[]>(),
      Job.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<IJobDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Job.findById(id).lean<IJobDocument>();
  },

  async upsertFromProvider(job: NormalizedJob): Promise<{ job: IJobDocument; isNew: boolean }> {
    const query = {
      $or: [
        { applyUrl: job.applyUrl },
        { externalId: job.externalId, source: job.source },
      ],
    };

    const rawResult = (await Job.findOneAndUpdate(
      query,
      { $set: job },
      {
        upsert: true,
        new: true,
        runValidators: true,
        rawResult: true,
      }
    )) as any;

    if (!rawResult?.value) {
      throw new Error('Failed to upsert job from provider');
    }

    const isNew = Boolean(rawResult.lastErrorObject?.upserted);

    return {
      job: rawResult.value as IJobDocument,
      isNew,
    };
  },

  async deleteById(id: string): Promise<IJobDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Job.findByIdAndDelete(id);
  },

  async count(): Promise<number> {
    return Job.countDocuments();
  },

  async countBySource(): Promise<Record<string, number>> {
    const results: SourceCount[] = await Job.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = {};
    for (const entry of results) {
      counts[entry._id] = entry.count;
    }
    return counts;
  },
};

export default jobRepository;
