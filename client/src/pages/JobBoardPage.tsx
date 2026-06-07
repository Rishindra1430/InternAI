import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBookmark, HiOutlineMapPin, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { jobApi } from '../api';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import { useAppDispatch, useJobs } from '../hooks';
import { setError, setJobs, setLoading, setSavedJobs } from '../store/slices/jobSlice';
import { formatDate, truncateText } from '../utils';
import type { Job, PaginatedJobs, SavedJob } from '../types';

const unwrap = <T,>(response: { data: unknown }): T => ((response.data as { data?: T }).data ?? response.data) as T;

export default function JobBoardPage() {
  const dispatch = useAppDispatch();
  const { jobs, savedJobs, pagination, isLoading, error } = useJobs();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);

  const savedIds = useMemo(
    () => new Set(savedJobs.map((saved) => typeof saved.jobId === 'string' ? saved.jobId : saved.jobId._id)),
    [savedJobs]
  );

  const fetchJobs = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await jobApi.getJobs({ search, location, source, page, limit: 12 });
      const payload = unwrap<PaginatedJobs>(response);
      dispatch(setJobs(payload));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Unable to load jobs'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, location, page, search, source]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await jobApi.getSavedJobs();
        dispatch(setSavedJobs(unwrap<SavedJob[]>(response)));
      } catch {
        dispatch(setSavedJobs([]));
      }
    };
    fetchSaved();
  }, [dispatch]);

  const toggleSave = async (job: Job) => {
    try {
      if (savedIds.has(job._id)) {
        await jobApi.unsaveJob(job._id);
      } else {
        await jobApi.saveJob(job._id);
      }
      const response = await jobApi.getSavedJobs();
      dispatch(setSavedJobs(unwrap<SavedJob[]>(response)));
    } catch {
      dispatch(setError('Unable to update saved job'));
    }
  };

  return (
    <div className="app-container space-y-6">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
        <SearchBar value={search} placeholder="Search roles, companies, or skills" onChange={(value) => { setSearch(value); setPage(1); }} />
        <input className="input" placeholder="Location" value={location} onChange={(event) => { setLocation(event.target.value); setPage(1); }} />
        <select className="input" value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }}>
          <option value="">All sources</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
          <option value="ashby">Ashby</option>
        </select>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center"><LoadingSpinner size="lg" label="Loading jobs" /></div>
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting the search or filters." icon={HiOutlineBookmark} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article key={job._id} className="card flex min-h-72 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">{job.company}</p>
                  <Link to={`/jobs/${job._id}`} className="mt-1 block text-lg font-bold text-slate-950 hover:text-blue-700">
                    {job.title}
                  </Link>
                </div>
                <button type="button" className={`rounded-lg p-2 ${savedIds.has(job._id) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`} onClick={() => toggleSave(job)} aria-label="Save job">
                  <HiOutlineBookmark className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge-primary">{job.source}</span>
                {job.isRemote ? <span className="badge-success">Remote</span> : null}
                {job.type ? <span className="badge-warning">{job.type}</span> : null}
              </div>
              <p className="mt-4 flex items-center gap-1 text-sm text-slate-500"><HiOutlineMapPin className="h-4 w-4" />{job.location}</p>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{truncateText(job.description.replace(/<[^>]*>/g, ''), 180)}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">Posted {formatDate(job.postedDate)}</span>
                <Link to={`/jobs/${job._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                  View <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={pagination.page || page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}
