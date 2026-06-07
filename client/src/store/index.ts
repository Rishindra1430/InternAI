import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobReducer from './slices/jobSlice';
import applicationReducer from './slices/applicationSlice';
import notificationReducer from './slices/notificationSlice';
import resumeReducer from './slices/resumeSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    applications: applicationReducer,
    notifications: notificationReducer,
    resumes: resumeReducer,
    ai: aiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
