import mongoose from 'mongoose';
import Notification, { type INotificationDocument } from '../models/Notification.model.js';

interface PaginatedNotifications {
  notifications: INotificationDocument[];
  total: number;
  page: number;
  totalPages: number;
}

const notificationRepository = {
  async findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedNotifications> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { notifications: [], total: 0, page, totalPages: 0 };
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<INotificationDocument[]>(),
      Notification.countDocuments({ userId: userObjectId }),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async create(data: {
    userId: string;
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<INotificationDocument> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(data.userId),
      type: data.type,
      message: data.message,
      metadata: data.metadata,
    });
    return notification.save();
  },

  async markRead(id: string): Promise<INotificationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Notification.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true }
    ).lean<INotificationDocument>();
  },

  async markAllRead(userId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
    const result = await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  },

  async countUnread(userId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return 0;
    return Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });
  },

  async deleteOld(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = await Notification.deleteMany({ createdAt: { $lt: cutoff } });
    return result.deletedCount;
  },
};

export default notificationRepository;
