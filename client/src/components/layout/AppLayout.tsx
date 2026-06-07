import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import useSocket from '../../hooks/useSocket';

export default function AppLayout() {
  useSocket();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
