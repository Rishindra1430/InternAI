import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Job, SavedJob, PaginatedJobs } from '../../types';

interface JobState {
  jobs: Job[];
  savedJobs: SavedJob[];
  currentJob: Job | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    location?: string;
    isRemote?: boolean;
    source?: string;
    skills?: string[];
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  savedJobs: [],
  currentJob: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<PaginatedJobs>) => {
      state.jobs = action.payload.jobs;
      state.pagination = {
        page: action.payload.page,
        limit: action.payload.limit,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    },
    setCurrentJob: (state, action: PayloadAction<Job>) => {
      state.currentJob = action.payload;
    },
    setSavedJobs: (state, action: PayloadAction<SavedJob[]>) => {
      state.savedJobs = action.payload;
    },
    addSavedJob: (state, action: PayloadAction<SavedJob>) => {
      state.savedJobs.push(action.payload);
    },
    removeSavedJob: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter((job) => job._id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setJobs,
  setCurrentJob,
  setSavedJobs,
  addSavedJob,
  removeSavedJob,
  setFilters,
  setLoading,
  setError,
} = jobSlice.actions;

export default jobSlice.reducer;
