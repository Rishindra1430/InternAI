import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as aiController from '../controllers/ai.controller.js';
import {
  analyzeResumeSchema,
  extractSkillsSchema,
  skillGapSchema,
  interviewPrepSchema,
} from '../validators/ai.validator.js';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

router.post(
  '/analyze-resume',
  validate(analyzeResumeSchema),
  aiController.analyzeResume
);

router.post(
  '/extract-skills',
  validate(extractSkillsSchema),
  aiController.extractSkills
);

router.post(
  '/skill-gap',
  validate(skillGapSchema),
  aiController.skillGap
);

router.post(
  '/interview-prep',
  validate(interviewPrepSchema),
  aiController.interviewPrep
);

export default router;
