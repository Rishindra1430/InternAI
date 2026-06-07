import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { InterviewPrepResult, ResumeAnalysis, SkillGapResult } from '../../types';

interface AiState {
  atsResult: ResumeAnalysis | null;
  skillGapResult: SkillGapResult | null;
  interviewPrepResult: InterviewPrepResult | null;
  analyzing: {
    ats: boolean;
    skillGap: boolean;
    interview: boolean;
  };
  error: string | null;
}

const initialState: AiState = {
  atsResult: null,
  skillGapResult: null,
  interviewPrepResult: null,
  analyzing: {
    ats: false,
    skillGap: false,
    interview: false,
  },
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setAtsResult: (state, action: PayloadAction<ResumeAnalysis | null>) => {
      state.atsResult = action.payload;
    },
    setSkillGapResult: (state, action: PayloadAction<SkillGapResult | null>) => {
      state.skillGapResult = action.payload;
    },
    setInterviewPrepResult: (state, action: PayloadAction<InterviewPrepResult | null>) => {
      state.interviewPrepResult = action.payload;
    },
    setAnalyzing: (
      state,
      action: PayloadAction<{ feature: keyof AiState['analyzing']; value: boolean }>
    ) => {
      state.analyzing[action.payload.feature] = action.payload.value;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearResults: (state) => {
      state.atsResult = null;
      state.skillGapResult = null;
      state.interviewPrepResult = null;
      state.error = null;
    },
  },
});

export const {
  setAtsResult,
  setSkillGapResult,
  setInterviewPrepResult,
  setAnalyzing,
  setError,
  clearResults,
} = aiSlice.actions;
export default aiSlice.reducer;
