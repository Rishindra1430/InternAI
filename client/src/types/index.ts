// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  skills: string[];
  education: string[];
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Job types
export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  applyUrl: string;
  source: 'greenhouse' | 'lever' | 'ashby';
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote: boolean;
  postedDate: string;
  externalId: string;
}

export interface SavedJob {
  _id: string;
  userId: string;
  jobId: Job;
  savedAt: string;
}

export interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Application types
export interface Application {
  _id: string;
  userId: string;
  jobId: string | Job;
  status: 'Applied' | 'Assessment' | 'Interview' | 'Rejected' | 'Offer' | 'Accepted';
  notes?: string;
  interviewDate?: string;
  timeline: TimelineEntry[];
  appliedAt: string;
  updatedAt: string;
}

export interface TimelineEntry {
  status: string;
  changedAt: string;
  note?: string;
}

// Resume types
export interface Resume {
  _id: string;
  userId: string;
  label: string;
  fileUrl: string;
  version: number;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  atsScore?: number;
  uploadedAt: string;
}

// Notification types
export interface Notification {
  _id?: string;
  id: string;
  title?: string;
  type: 'new_job' | 'interview_reminder' | 'status_change';
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// AI Analysis types
export interface ResumeAnalysis {
  score: number;
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
}

export interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface InterviewPrepResult {
  technicalQuestions: string[];
  hrQuestions: string[];
  companySpecificQuestions: string[];
}

export interface ExtractedSkills {
  skills: string[];
  experience: string[];
  education: string[];
}

// Analytics types
export interface Analytics {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  jobsBySource: Record<string, number>;
}
