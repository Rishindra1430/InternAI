import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/refresh-token',
  authController.refreshToken
);

router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  authController.resetPassword
);

router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

export default router;
