import { Readable } from 'stream';
import mongoose from 'mongoose';
import resumeRepository from '../repositories/resume.repository.js';
import { cloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/response.utils.js';
import { logger } from '../config/logger.js';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  resource_type: string;
  url: string;
}

interface ResumeDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  version: number;
  label: string;
  fileUrl: string;
  publicId: string;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  atsScore?: number;
  uploadedAt: Date;
}

function uploadToCloudinary(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error: unknown, result: CloudinaryUploadResult | undefined) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export const resumeService = {
  async getResumes(userId: string): Promise<ResumeDocument[]> {
    const resumes = await resumeRepository.findByUser(userId);
    return resumes as unknown as ResumeDocument[];
  },

  async uploadResume(
    userId: string,
    file: UploadedFile,
    label?: string
  ): Promise<ResumeDocument> {
    if (!file || !file.buffer) {
      throw new AppError('No file provided', 400);
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError(
        'Invalid file type. Only PDF and Word documents are allowed.',
        400
      );
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeBytes) {
      throw new AppError('File size exceeds the 10MB limit', 400);
    }

    const uploadResult = await uploadToCloudinary(file.buffer, {
      folder: 'internai/resumes',
      resource_type: 'auto',
    });

    const version = await resumeRepository.getNextVersion(userId);

    const resumeLabel = label ?? `Resume v${version}`;

    const resume = await resumeRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      label: resumeLabel,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      version,
      extractedSkills: [],
      extractedExperience: [],
      extractedEducation: [],
      atsScore: undefined,
    });

    logger.info(`User ${userId} uploaded resume: ${resumeLabel} (v${version})`);

    return resume as unknown as ResumeDocument;
  },

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (String(resume.userId) !== userId) {
      throw new AppError('You do not have permission to delete this resume', 403);
    }

    const resumeDoc = resume as unknown as ResumeDocument;

    try {
      await cloudinary.uploader.destroy(resumeDoc.publicId, {
        resource_type: 'raw',
      });
    } catch (cloudinaryError) {
      logger.error(
        `Failed to delete resume from Cloudinary (publicId: ${resumeDoc.publicId}): ${String(cloudinaryError)}`
      );
      // Continue with DB deletion even if Cloudinary fails
    }

    await resumeRepository.deleteById(resumeId);

    logger.info(`User ${userId} deleted resume ${resumeId}`);
  },
};
