import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Application } from '../../types';

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  statusCounts: {
    Applied: number;
    Assessment: number;
    Interview: number;
    Rejected: number;
    Offer: number;
    Accepted: number;
  };
}

const initialState: ApplicationState = {
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  statusCounts: {
    Applied: 0,
    Assessment: 0,
    Interview: 0,
    Rejected: 0,
    Offer: 0,
    Accepted: 0,
  },
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
      
      // Calculate status counts
      const counts = {
        Applied: 0,
        Assessment: 0,
        Interview: 0,
        Rejected: 0,
        Offer: 0,
        Accepted: 0,
      };
      
      action.payload.forEach((app) => {
        counts[app.status as keyof typeof counts]++;
      });
      
      state.statusCounts = counts;
    },
    setCurrentApplication: (state, action: PayloadAction<Application>) => {
      state.currentApplication = action.payload;
    },
    updateApplication: (state, action: PayloadAction<Application>) => {
      const index = state.applications.findIndex((app) => app._id === action.payload._id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    addApplication: (state, action: PayloadAction<Application>) => {
      state.applications.push(action.payload);
    },
    removeApplication: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter((app) => app._id !== action.payload);
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
  setApplications,
  setCurrentApplication,
  updateApplication,
  addApplication,
  removeApplication,
  setLoading,
  setError,
} = applicationSlice.actions;

export default applicationSlice.reducer;
