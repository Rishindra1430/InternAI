import mongoose from 'mongoose';

export interface INotification {
  userId: mongoose.Types.ObjectId;
  type: 'new_job' | 'interview_reminder' | 'status_change';
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface INotificationDocument extends INotification, mongoose.Document {}

const notificationSchema = new mongoose.Schema<INotificationDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['new_job', 'interview_reminder', 'status_change'],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ createdAt: 1 });

const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);

export default Notification;
