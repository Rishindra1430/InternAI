import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Resume } from '../../types';

interface ResumeState {
  resumes: Resume[];
  uploading: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumes: [],
  uploading: false,
  isLoading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resumes',
  initialState,
  reducers: {
    setResumes: (state, action: PayloadAction<Resume[]>) => {
      state.resumes = action.payload;
    },
    addResume: (state, action: PayloadAction<Resume>) => {
      state.resumes.unshift(action.payload);
    },
    removeResume: (state, action: PayloadAction<string>) => {
      state.resumes = state.resumes.filter((resume) => resume._id !== action.payload);
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setResumes, addResume, removeResume, setUploading, setLoading, setError } =
  resumeSlice.actions;
export default resumeSlice.reducer;
