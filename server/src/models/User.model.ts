import mongoose from 'mongoose';

export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  profilePicture?: string;
  skills: string[];
  education: IEducation[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, mongoose.Document {}

const educationSchema = new mongoose.Schema<IEducation>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profilePicture: { type: String },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
