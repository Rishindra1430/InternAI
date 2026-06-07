import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.utils.js';
import { aiService } from '../services/ai.service.js';

export const analyzeResume = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await aiService.analyzeResume(
      req.body.resumeText as string,
      req.body.jobDescription as string
    );
    sendSuccess(res, result, 'Resume analysis completed successfully.');
  }
);

export const extractSkills = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await aiService.extractSkills(
      req.body.resumeText as string
    );
    sendSuccess(res, result, 'Skills extracted successfully.');
  }
);

export const skillGap = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.skillGapAnalysis(
    req.body.resumeSkills as string[],
    req.body.jobRequirements as string[]
  );
  sendSuccess(res, result, 'Skill gap analysis completed successfully.');
});

export const interviewPrep = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await aiService.interviewPrep(
      req.body.jobDescription as string,
      req.body.resumeText as string,
      req.body.companyName as string
    );
    sendSuccess(res, result, 'Interview prep generated successfully.');
  }
);
