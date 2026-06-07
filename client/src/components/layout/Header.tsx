import { useLocation } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../hooks';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Job Board',
  '/applications': 'Applications',
  '/resume': 'Resume',
  '/ai-analyzer': 'AI Analyzer',
  '/interview-prep': 'Interview Prep',
  '/profile': 'Profile',
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const title = titles[location.pathname] ?? (location.pathname.startsWith('/jobs/') ? 'Job Detail' : 'InternAI');

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Workspace</p>
          <h1 className="text-xl font-bold text-slate-950">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-950">{user?.name ?? 'Candidate'}</p>
            <p className="text-xs text-slate-500">{user?.email ?? 'Ready to apply'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
