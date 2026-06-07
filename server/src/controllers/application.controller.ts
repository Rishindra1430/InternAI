import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.utils.js';
import { applicationService } from '../services/application.service.js';

export const getApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const applications = await applicationService.getApplications(
      req.user.userId,
      status
    );
    sendSuccess(res, applications, 'Applications retrieved successfully.');
  }
);

export const createApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const application = await applicationService.createApplication(req.user.userId, req.body);
    sendSuccess(res, application, 'Application created successfully.', 201);
  }
);

export const updateStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await applicationService.updateStatus(
      req.user.userId,
      req.params.id as string,
      req.body.status,
      req.body.note
    );
    sendSuccess(res, result, 'Application status updated successfully.');
  }
);

export const updateNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await applicationService.updateNotes(
      req.user.userId,
      req.params.id as string,
      req.body.notes
    );
    sendSuccess(res, result, 'Application notes updated successfully.');
  }
);

export const setInterviewDate = asyncHandler(
  async (req: Request, res: Response) => {
    const interviewDate = new Date(req.body.interviewDate as string);
    const result = await applicationService.setInterviewDate(
      req.user.userId,
      req.params.id as string,
      interviewDate
    );
    sendSuccess(res, result, 'Interview date set successfully.');
  }
);

export const deleteApplication = asyncHandler(
  async (req: Request, res: Response) => {
    await applicationService.deleteApplication(req.user.userId, req.params.id as string);
    sendSuccess(res, null, 'Application deleted successfully.');
  }
);
