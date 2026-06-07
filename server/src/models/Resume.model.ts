import mongoose from 'mongoose';

export interface IResume {
  userId: mongoose.Types.ObjectId;
  version: number;
  label: string;
  fileUrl: string;
  publicId: string;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  atsScore?: number;
  uploadedAt: Date;
}

export interface IResumeDocument extends IResume, mongoose.Document {}

const resumeSchema = new mongoose.Schema<IResumeDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    version: { type: Number, required: true },
    label: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    extractedSkills: { type: [String], default: [] },
    extractedExperience: { type: [String], default: [] },
    extractedEducation: { type: [String], default: [] },
    atsScore: { type: Number, min: 0, max: 100 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

resumeSchema.index({ userId: 1 });

const Resume = mongoose.model<IResumeDocument>('Resume', resumeSchema);

export default Resume;
