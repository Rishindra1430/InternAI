import mongoose from 'mongoose';

export interface ITimelineEntry {
  status: string;
  changedAt: Date;
  note?: string;
}

export interface IApplication {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: 'Applied' | 'Assessment' | 'Interview' | 'Rejected' | 'Offer' | 'Accepted';
  notes?: string;
  interviewDate?: Date;
  timeline: ITimelineEntry[];
  appliedAt: Date;
  updatedAt: Date;
}

export interface IApplicationDocument extends IApplication, mongoose.Document {}

const timelineEntrySchema = new mongoose.Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema<IApplicationDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['Applied', 'Assessment', 'Interview', 'Rejected', 'Offer', 'Accepted'],
      default: 'Applied',
    },
    notes: { type: String },
    interviewDate: { type: Date },
    timeline: { type: [timelineEntrySchema], default: [] },
  },
  { timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' } }
);

applicationSchema.index({ userId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model<IApplicationDocument>('Application', applicationSchema);

export default Application;
