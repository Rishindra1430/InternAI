import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

router.get('/jobs', adminController.getJobs);
router.delete('/jobs/:id', adminController.deleteJob);

router.get('/analytics', adminController.getAnalytics);

router.post('/trigger-job-fetch', adminController.triggerJobFetch);

export default router;
