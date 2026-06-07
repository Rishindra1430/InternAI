import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { jobSearchSchema } from '../validators/job.validator.js';
import * as jobController from '../controllers/job.controller.js';

const router = Router();

// All job routes require authentication
router.use(authenticate);

// GET /saved must come BEFORE /:id to avoid "saved" being matched as an id param
router.get(
  '/saved',
  jobController.getSavedJobs
);

router.get(
  '/',
  validate(jobSearchSchema, 'query'),
  jobController.getJobs
);

router.get(
  '/:id',
  jobController.getJobById
);

router.post(
  '/save/:id',
  jobController.saveJob
);

router.delete(
  '/save/:id',
  jobController.unsaveJob
);

export default router;
