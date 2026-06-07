import { useEffect, useMemo, useState } from 'react';
import { HiOutlineBriefcase, HiOutlineListBullet, HiOutlineRectangleGroup } from 'react-icons/hi2';
import { applicationApi } from '../api';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppDispatch, useApplications } from '../hooks';
import { setApplications, setLoading, updateApplication } from '../store/slices/applicationSlice';
import { formatDate } from '../utils';
import type { Application, Job } from '../types';

const statuses: Application['status'][] = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted'];
const unwrap = <T,>(response: { data: unknown }): T => ((response.data as { data?: T }).data ?? response.data) as T;
const getJob = (app: Application) => typeof app.jobId === 'string' ? { title: app.jobId, company: 'Tracked job' } : app.jobId as Job;

export default function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const { applications, statusCounts, isLoading } = useApplications();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    const fetchApplications = async () => {
      dispatch(setLoading(true));
      try {
        const response = await applicationApi.getApplications();
        dispatch(setApplications(unwrap<Application[]>(response)));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchApplications();
  }, [dispatch]);

  const grouped = useMemo(
    () => statuses.map((status) => ({ status, items: applications.filter((app) => app.status === status) })),
    [applications]
  );

  const changeStatus = async (application: Application, status: Application['status']) => {
    const response = await applicationApi.updateStatus(application._id, status);
    dispatch(updateApplication(unwrap<Application>(response)));
  };

  if (isLoading) return <div className="app-container flex min-h-96 items-center justify-center"><LoadingSpinner size="lg" label="Loading applications" /></div>;

  return (
    <div className="app-container space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {statuses.map((status) => <div key={status} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center"><p className="text-xl font-bold">{statusCounts[status]}</p><p className="text-xs text-slate-500">{status}</p></div>)}
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button type="button" className={`rounded-md p-2 ${view === 'kanban' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`} onClick={() => setView('kanban')} aria-label="Kanban view"><HiOutlineRectangleGroup className="h-5 w-5" /></button>
          <button type="button" className={`rounded-md p-2 ${view === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`} onClick={() => setView('list')} aria-label="List view"><HiOutlineListBullet className="h-5 w-5" /></button>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={HiOutlineBriefcase} title="No applications yet" description="Use a job detail page to add an application to your tracker." />
      ) : view === 'kanban' ? (
        <div className="grid gap-4 xl:grid-cols-6">
          {grouped.map((column) => (
            <section key={column.status} className="kanban-column">
              <h2 className="mb-3 flex items-center justify-between text-sm font-bold text-slate-700">{column.status}<span>{column.items.length}</span></h2>
              <div className="space-y-3">
                {column.items.map((app) => {
                  const job = getJob(app);
                  return (
                    <article key={app._id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <h3 className="font-semibold text-slate-950">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                      <p className="mt-2 text-xs text-slate-400">Applied {formatDate(app.appliedAt)}</p>
                      <select className="input mt-3 py-1.5 text-sm" value={app.status} onChange={(event) => changeStatus(app, event.target.value as Application['status'])}>
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500"><th className="py-3">Job</th><th>Status</th><th>Applied</th><th>Updated</th></tr></thead>
            <tbody>{applications.map((app) => { const job = getJob(app); return <tr key={app._id} className="border-b last:border-0"><td className="py-3 font-medium">{job.title}<p className="text-xs text-slate-500">{job.company}</p></td><td>{app.status}</td><td>{formatDate(app.appliedAt)}</td><td>{formatDate(app.updatedAt)}</td></tr>; })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
