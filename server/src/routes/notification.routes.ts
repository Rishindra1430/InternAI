import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get(
  '/',
  notificationController.getNotifications
);

// PUT /read-all must come BEFORE /:id/read to avoid "read-all" matching as an id
router.put(
  '/read-all',
  notificationController.markAllRead
);

router.put(
  '/:id/read',
  notificationController.markRead
);

export default router;
