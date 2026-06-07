import applicationRepository from '../repositories/application.repository.js';
import jobRepository from '../repositories/job.repository.js';
import { AppError } from '../utils/response.utils.js';
import mongoose from 'mongoose';

interface CreateApplicationData {
  jobId: string;
  status?: string;
  notes?: string;
}

interface ApplicationDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: string;
  notes: string;
  interviewDate: Date | null;
  timeline: Array<{ status: string; changedAt: Date; note?: string }>;
  appliedAt: Date;
  updatedAt: Date;
}

async function verifyOwnership(
  userId: string,
  applicationId: string
): Promise<ApplicationDocument> {
  const application = await applicationRepository.findById(applicationId);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (String(application.userId) !== userId) {
    throw new AppError('You do not have permission to access this application', 403);
  }

  return application as ApplicationDocument;
}

export const applicationService = {
  async getApplications(
    userId: string,
    status?: string
  ): Promise<ApplicationDocument[]> {
    const applications = await applicationRepository.findByUser(userId, status);
    return applications as unknown as ApplicationDocument[];
  },

  async createApplication(
    userId: string,
    data: CreateApplicationData
  ): Promise<ApplicationDocument> {
    const job = await jobRepository.findById(data.jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    const existing = await applicationRepository.findByUserAndJob(
      userId,
      data.jobId
    );
    if (existing) {
      throw new AppError('You have already applied to this job', 409);
    }

    const initialStatus = data.status ?? 'Applied';

    const application = await applicationRepository.create({
      userId,
      jobId: data.jobId,
      status: initialStatus,
      notes: data.notes ?? '',
    });

    return application as unknown as ApplicationDocument;
  },

  async updateStatus(
    userId: string,
    applicationId: string,
    status: string,
    note?: string
  ): Promise<ApplicationDocument> {
    await verifyOwnership(userId, applicationId);

    const updated = await applicationRepository.updateStatus(
      applicationId,
      status,
      note
    );

    if (!updated) {
      throw new AppError('Failed to update application status', 500);
    }

    return updated as unknown as ApplicationDocument;
  },

  async updateNotes(
    userId: string,
    applicationId: string,
    notes: string
  ): Promise<ApplicationDocument> {
    await verifyOwnership(userId, applicationId);

    const updated = await applicationRepository.updateNotes(
      applicationId,
      notes
    );

    if (!updated) {
      throw new AppError('Failed to update application notes', 500);
    }

    return updated as unknown as ApplicationDocument;
  },

  async setInterviewDate(
    userId: string,
    applicationId: string,
    date: Date
  ): Promise<ApplicationDocument> {
    await verifyOwnership(userId, applicationId);

    if (date < new Date()) {
      throw new AppError('Interview date must be in the future', 400);
    }

    const updated = await applicationRepository.setInterviewDate(
      applicationId,
      date
    );

    if (!updated) {
      throw new AppError('Failed to set interview date', 500);
    }

    return updated as unknown as ApplicationDocument;
  },

  async deleteApplication(
    userId: string,
    applicationId: string
  ): Promise<void> {
    await verifyOwnership(userId, applicationId);
    await applicationRepository.deleteById(applicationId);
  },
};
