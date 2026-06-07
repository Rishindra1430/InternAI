import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as applicationController from '../controllers/application.controller.js';
import {
  createApplicationSchema,
  updateStatusSchema,
  updateNotesSchema,
  setInterviewDateSchema,
} from '../validators/application.validator.js';

const router = Router();

// All application routes require authentication
router.use(authenticate);

router.get(
  '/',
  applicationController.getApplications
);

router.post(
  '/',
  validate(createApplicationSchema),
  applicationController.createApplication
);

router.put(
  '/:id/status',
  validate(updateStatusSchema),
  applicationController.updateStatus
);

router.put(
  '/:id/notes',
  validate(updateNotesSchema),
  applicationController.updateNotes
);

router.put(
  '/:id/interview-date',
  validate(setInterviewDateSchema),
  applicationController.setInterviewDate
);

router.delete(
  '/:id',
  applicationController.deleteApplication
);

export default router;
