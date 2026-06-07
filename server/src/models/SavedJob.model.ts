import mongoose from 'mongoose';

export interface ISavedJob {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  savedAt: Date;
}

export interface ISavedJobDocument extends ISavedJob, mongoose.Document {}

const savedJobSchema = new mongoose.Schema<ISavedJobDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.model<ISavedJobDocument>('SavedJob', savedJobSchema);

export default SavedJob;
