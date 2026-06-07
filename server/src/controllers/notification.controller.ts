import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.utils.js';
import { notificationService } from '../services/notification.service.js';

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const result = await notificationService.getNotifications(
      req.user.userId,
      page,
      limit
    );
    sendSuccess(res, result, 'Notifications retrieved successfully.');
  }
);

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.markRead(
    req.params.id as string,
    req.user.userId
  );
  sendSuccess(res, result, 'Notification marked as read.');
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.markAllRead(req.user.userId);
  sendSuccess(res, result, 'All notifications marked as read.');
});
