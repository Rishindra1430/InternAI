import { useEffect, useState } from 'react';
import { HiOutlineArrowDownTray, HiOutlineDocumentArrowUp, HiOutlineTrash } from 'react-icons/hi2';
import { resumeApi } from '../api';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppDispatch, useResumes } from '../hooks';
import { addResume, removeResume, setLoading, setResumes, setUploading } from '../store/slices/resumeSlice';
import { formatDate } from '../utils';
import type { Resume } from '../types';

const unwrap = <T,>(response: { data: unknown }): T => ((response.data as { data?: T }).data ?? response.data) as T;

export default function ResumePage() {
  const dispatch = useAppDispatch();
  const { resumes, isLoading, uploading } = useResumes();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      dispatch(setLoading(true));
      try {
        const response = await resumeApi.getResumes();
        dispatch(setResumes(unwrap<Resume[]>(response)));
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchResumes();
  }, [dispatch]);

  const upload = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Upload a PDF, DOC, or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be 5MB or smaller.');
      return;
    }
    dispatch(setUploading(true));
    try {
      const response = await resumeApi.uploadResume(file, file.name);
      dispatch(addResume(unwrap<Resume>(response)));
    } finally {
      dispatch(setUploading(false));
    }
  };

  const deleteResume = async (id: string) => {
    await resumeApi.deleteResume(id);
    dispatch(removeResume(id));
  };

  return (
    <div className="app-container space-y-6">
      <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-blue-300 hover:bg-blue-50/30">
        <HiOutlineDocumentArrowUp className="h-11 w-11 text-blue-600" />
        <span className="mt-3 text-base font-semibold text-slate-950">{uploading ? 'Uploading...' : 'Upload resume'}</span>
        <span className="mt-1 text-sm text-slate-500">PDF, DOC, or DOCX up to 5MB</span>
        <input className="hidden" type="file" accept=".pdf,.doc,.docx" onChange={(event) => upload(event.target.files?.[0])} disabled={uploading} />
      </label>
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {isLoading ? <LoadingSpinner label="Loading resumes" /> : resumes.length === 0 ? (
        <EmptyState title="No resumes uploaded" description="Upload a resume to use AI analysis and application tracking." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume) => (
            <article key={resume._id} className="card">
              <h2 className="font-bold text-slate-950">{resume.label}</h2>
              <p className="mt-1 text-sm text-slate-500">Version {resume.version} · Uploaded {formatDate(resume.uploadedAt)}</p>
              <div className="mt-4 flex flex-wrap gap-2">{resume.extractedSkills?.slice(0, 6).map((skill) => <span key={skill} className="badge bg-slate-100 text-slate-700">{skill}</span>)}</div>
              <div className="mt-5 flex gap-2">
                <a className="btn-outline inline-flex items-center gap-2" href={resume.fileUrl} target="_blank" rel="noreferrer"><HiOutlineArrowDownTray className="h-4 w-4" />Open</a>
                <button type="button" className="btn-danger inline-flex items-center gap-2" onClick={() => deleteResume(resume._id)}><HiOutlineTrash className="h-4 w-4" />Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
