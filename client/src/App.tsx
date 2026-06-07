import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './hooks';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppLayout from './components/layout/AppLayout';
import JobBoardPage from './pages/JobBoardPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ResumePage from './pages/ResumePage';
import AiAnalyzerPage from './pages/AiAnalyzerPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import ProfilePage from './pages/ProfilePage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobBoardPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/ai-analyzer" element={<AiAnalyzerPage />} />
        <Route path="/interview-prep" element={<InterviewPrepPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}
