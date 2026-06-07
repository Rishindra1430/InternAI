import { NavLink } from 'react-router-dom';
import {
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineUserCircle,
  HiOutlineBriefcase,
  HiOutlineRectangleGroup,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import type { IconType } from 'react-icons';
import { useAuth } from '../../hooks';
import { getInitials } from '../../utils';

const navItems: Array<{ label: string; to: string; icon: IconType }> = [
  { label: 'Dashboard', to: '/', icon: HiOutlineChartPie },
  { label: 'Jobs', to: '/jobs', icon: HiOutlineBriefcase },
  { label: 'Applications', to: '/applications', icon: HiOutlineRectangleGroup },
  { label: 'Resume', to: '/resume', icon: HiOutlineDocumentText },
  { label: 'AI Analyzer', to: '/ai-analyzer', icon: HiOutlineSparkles },
  { label: 'Interview Prep', to: '/interview-prep', icon: HiOutlineChatBubbleLeftRight },
  { label: 'Profile', to: '/profile', icon: HiOutlineUserCircle },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 font-bold text-white">IA</div>
        <div className="ml-3">
          <p className="font-bold text-slate-950">InternAI</p>
          <p className="text-xs text-slate-500">Smart Job Tracker</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
            {getInitials(user?.name ?? 'User')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{user?.name ?? 'InternAI User'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? 'Signed in'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
