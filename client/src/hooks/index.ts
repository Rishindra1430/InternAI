import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = useDispatch as () => AppDispatch;
export const useAppSelector = useSelector as <T,>(selector: (state: RootState) => T) => T;

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  return auth;
};

export const useJobs = () => {
  const jobs = useAppSelector((state) => state.jobs);
  return jobs;
};

export const useApplications = () => {
  const applications = useAppSelector((state) => state.applications);
  return applications;
};

export const useNotifications = () => {
  const notifications = useAppSelector((state) => state.notifications);
  return notifications;
};

export const useResumes = () => {
  const resumes = useAppSelector((state) => state.resumes);
  return resumes;
};

export const useAI = () => {
  const ai = useAppSelector((state) => state.ai);
  return ai;
};
