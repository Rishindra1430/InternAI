import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';
import * as resumeController from '../controllers/resume.controller.js';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

router.get(
  '/',
  resumeController.getResumes
);

router.post(
  '/upload',
  uploadResume,
  resumeController.uploadResume
);

router.delete(
  '/:id',
  resumeController.deleteResume
);

export default router;
