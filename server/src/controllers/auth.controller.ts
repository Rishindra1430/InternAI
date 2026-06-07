import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, AppError } from '../utils/response.utils.js';
import { env } from '../config/env.js';
import { authService } from '../services/auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendSuccess(res, result, 'Registration successful.', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  const isProduction = env.NODE_ENV === 'production';

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  sendSuccess(
    res,
    { user: result.user, accessToken: result.accessToken },
    'Login successful.'
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user.userId);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  sendSuccess(res, null, 'Logout successful.');
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      throw new AppError('No refresh token provided.', 401);
    }

    const result = await authService.refreshToken(token);

    sendSuccess(
      res,
      { accessToken: result.accessToken },
      'Token refreshed successfully.'
    );
  }
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token as string);
  sendSuccess(res, null, 'Email verified successfully.');
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(
      res,
      null,
      'If an account with that email exists, a password reset link has been sent.'
    );
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.resetPassword(req.params.token as string, req.body.password);
    sendSuccess(res, null, 'Password reset successful.');
  }
);

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user.userId);
  sendSuccess(res, user, 'User profile retrieved successfully.');
});
