import mongoose from 'mongoose';

export interface IJob {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  applyUrl: string;
  source: 'greenhouse' | 'lever' | 'ashby';
  isRemote: boolean;
  postedDate: Date;
  externalId: string;
  createdAt: Date;
}

export interface IJobDocument extends IJob, mongoose.Document {}

const jobSchema = new mongoose.Schema<IJobDocument>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    applyUrl: { type: String, required: true, unique: true },
    source: { type: String, enum: ['greenhouse', 'lever', 'ashby'], required: true },
    isRemote: { type: Boolean, default: false },
    postedDate: { type: Date, required: true },
    externalId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

jobSchema.index({ title: 'text', company: 'text' });
jobSchema.index({ skills: 1 });
jobSchema.index({ applyUrl: 1 }, { unique: true });
jobSchema.index({ externalId: 1, source: 1 }, { unique: true });

const Job = mongoose.model<IJobDocument>('Job', jobSchema);

export default Job;
