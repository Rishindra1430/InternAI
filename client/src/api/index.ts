import apiClient from './client';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email/${token}`),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post(`/auth/reset-password/${token}`, { password }),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),
};

export const jobApi = {
  getJobs: (params?: Record<string, unknown>) =>
    apiClient.get('/jobs', { params }),

  getJobById: (id: string) =>
    apiClient.get(`/jobs/${id}`),

  getSavedJobs: () =>
    apiClient.get('/jobs/saved'),

  saveJob: (id: string) =>
    apiClient.post(`/jobs/save/${id}`),

  unsaveJob: (id: string) =>
    apiClient.delete(`/jobs/save/${id}`),
};

export const applicationApi = {
  getApplications: (status?: string) =>
    apiClient.get('/applications', { params: { status } }),

  createApplication: (data: Record<string, unknown>) =>
    apiClient.post('/applications', data),

  updateStatus: (id: string, status: string, note?: string) =>
    apiClient.put(`/applications/${id}/status`, { status, note }),

  updateNotes: (id: string, notes: string) =>
    apiClient.put(`/applications/${id}/notes`, { notes }),

  setInterviewDate: (id: string, interviewDate: string) =>
    apiClient.put(`/applications/${id}/interview-date`, { interviewDate }),

  deleteApplication: (id: string) =>
    apiClient.delete(`/applications/${id}`),
};

export const resumeApi = {
  getResumes: () =>
    apiClient.get('/resumes'),

  uploadResume: (file: File, label?: string) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (label) {
      formData.append('label', label);
    }
    return apiClient.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteResume: (id: string) =>
    apiClient.delete(`/resumes/${id}`),
};

export const aiApi = {
  analyzeResume: (resumeText: string, jobDescription: string) =>
    apiClient.post('/ai/analyze-resume', { resumeText, jobDescription }),

  extractSkills: (resumeText: string) =>
    apiClient.post('/ai/extract-skills', { resumeText }),

  skillGap: (resumeSkills: string[], jobRequirements: string[]) =>
    apiClient.post('/ai/skill-gap', { resumeSkills, jobRequirements }),

  interviewPrep: (jobDescription: string, resumeText: string, companyName: string) =>
    apiClient.post('/ai/interview-prep', { jobDescription, resumeText, companyName }),
};

export const notificationApi = {
  getNotifications: (page?: number, limit?: number) =>
    apiClient.get('/notifications', { params: { page, limit } }),

  markRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.put('/notifications/read-all'),
};
