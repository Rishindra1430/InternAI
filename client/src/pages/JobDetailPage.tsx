import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineBookmark, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { applicationApi, jobApi, resumeApi } from '../api';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { useAppDispatch, useJobs } from '../hooks';
import { setCurrentJob, setSavedJobs } from '../store/slices/jobSlice';
import { formatDate } from '../utils';
import type { Job, Resume, SavedJob } from '../types';

const unwrap = <T,>(response: { data: unknown }): T => ((response.data as { data?: T }).data ?? response.data) as T;

export default function JobDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { currentJob, savedJobs } = useJobs();
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');

  const isSaved = useMemo(
    () => savedJobs.some((saved) => (typeof saved.jobId === 'string' ? saved.jobId : saved.jobId._id) === id),
    [id, savedJobs]
  );

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [jobResponse, savedResponse, resumeResponse] = await Promise.all([
          jobApi.getJobById(id),
          jobApi.getSavedJobs(),
          resumeApi.getResumes(),
        ]);
        dispatch(setCurrentJob(unwrap<Job>(jobResponse)));
        dispatch(setSavedJobs(unwrap<SavedJob[]>(savedResponse)));
        setResumes(unwrap<Resume[]>(resumeResponse));
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [dispatch, id]);

  const toggleSave = async () => {
    if (!id) return;
    if (isSaved) await jobApi.unsaveJob(id);
    else await jobApi.saveJob(id);
    const response = await jobApi.getSavedJobs();
    dispatch(setSavedJobs(unwrap<SavedJob[]>(response)));
  };

  const submitApplication = async () => {
    if (!id) return;
    await applicationApi.createApplication({ jobId: id, resumeId: resumeId || undefined, coverLetter });
    setMessage('Application added to your tracker.');
    setApplyOpen(false);
  };

  if (loading) {
    return <div className="app-container flex min-h-96 items-center justify-center"><LoadingSpinner size="lg" label="Loading job" /></div>;
  }

  if (!currentJob) {
    return <div className="app-container"><EmptyState title="Job not found" action={<Link className="btn-primary" to="/jobs">Back to jobs</Link>} /></div>;
  }

  return (
    <div className="app-container space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <HiOutlineArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      {message ? <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</div> : null}

      <section className="card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-400">{currentJob.company}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{currentJob.title}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge-primary">{currentJob.source}</span>
              <span className="badge-success">{currentJob.isRemote ? 'Remote' : currentJob.location}</span>
              <span className="badge-warning">Posted {formatDate(currentJob.postedDate)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-outline inline-flex items-center gap-2" onClick={toggleSave}>
              <HiOutlineBookmark className="h-5 w-5" /> {isSaved ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => setApplyOpen(true)}>
              <HiOutlinePaperAirplane className="h-5 w-5" /> Track Apply
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="card">
          <h3 className="text-lg font-bold text-slate-950">Description</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600" dangerouslySetInnerHTML={{ __html: currentJob.description }} />
        </article>
        <aside className="card h-fit">
          <h3 className="text-lg font-bold text-slate-950">Role Details</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-slate-400">Company</dt><dd className="font-medium text-slate-900">{currentJob.company}</dd></div>
            <div><dt className="text-slate-400">Location</dt><dd className="font-medium text-slate-900">{currentJob.location}</dd></div>
            <div><dt className="text-slate-400">Skills</dt><dd className="mt-1 flex flex-wrap gap-1">{currentJob.skills.map((skill) => <span key={skill} className="badge bg-slate-100 text-slate-700">{skill}</span>)}</dd></div>
          </dl>
        </aside>
      </section>

      <Modal open={applyOpen} title="Add Application" onClose={() => setApplyOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="label">Resume</label>
            <select className="input" value={resumeId} onChange={(event) => setResumeId(event.target.value)}>
              <option value="">No resume selected</option>
              {resumes.map((resume) => <option key={resume._id} value={resume._id}>{resume.label} v{resume.version}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cover letter notes</label>
            <textarea className="input min-h-32" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} />
          </div>
          <button type="button" className="btn-primary w-full" onClick={submitApplication}>Add to tracker</button>
        </div>
      </Modal>
    </div>
  );
}
