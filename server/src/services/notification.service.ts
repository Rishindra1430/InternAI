import notificationRepository from '../repositories/notification.repository.js';
import { AppError } from '../utils/response.utils.js';
import { emitNotification, type NotificationPayload } from '../sockets/notification.socket.js';
import mongoose from 'mongoose';

interface NotificationDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'new_job' | 'interview_reminder' | 'status_change';
  message: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

interface PaginatedNotifications {
  notifications: NotificationDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateNotificationData {
  userId: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export const notificationService = {
  async getNotifications(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedNotifications> {
    const currentPage = page ?? 1;
    const perPage = limit ?? 20;

    const { notifications, total } = await notificationRepository.findByUser(
      userId,
      currentPage,
      perPage
    );

    return {
      notifications: notifications as unknown as NotificationDocument[],
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    };
  },

  async createNotification(
    data: CreateNotificationData
  ): Promise<NotificationDocument> {
    const notification = await notificationRepository.create({
      userId: data.userId,
      type: data.type,
      message: data.message,
      metadata: data.metadata ?? {},
    });

    const payload: NotificationPayload = {
      id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      metadata: notification.metadata ?? {},
      read: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };

    emitNotification(data.userId, payload);

    return notification as unknown as NotificationDocument;
  },

  async markRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationDocument> {
    const notification = await notificationRepository.markRead(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (String(notification.userId) !== userId) {
      throw new AppError(
        'You do not have permission to modify this notification',
        403
      );
    }

    return notification as unknown as NotificationDocument;
  },

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const count = await notificationRepository.countUnread(userId);
    return count;
  },
};
