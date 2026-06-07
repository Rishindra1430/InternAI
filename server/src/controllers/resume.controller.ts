import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, AppError } from '../utils/response.utils.js';
import { resumeService } from '../services/resume.service.js';

export const getResumes = asyncHandler(async (req: Request, res: Response) => {
  const resumes = await resumeService.getResumes(req.user.userId);
  sendSuccess(res, resumes, 'Resumes retrieved successfully.');
});

export const uploadResume = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(
        'No resume file provided. Please upload a PDF file.',
        400
      );
    }

    const label = req.body.label as string | undefined;
    const result = await resumeService.uploadResume(
      req.user.userId,
      req.file,
      label
    );
    sendSuccess(res, result, 'Resume uploaded successfully.', 201);
  }
);

export const deleteResume = asyncHandler(
  async (req: Request, res: Response) => {
    await resumeService.deleteResume(req.user.userId, req.params.id as string);
    sendSuccess(res, null, 'Resume deleted successfully.');
  }
);
