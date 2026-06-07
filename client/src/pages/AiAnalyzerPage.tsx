import { useState } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { aiApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppDispatch, useAI } from '../hooks';
import { setAnalyzing, setAtsResult, setError } from '../store/slices/aiSlice';
import type { ResumeAnalysis } from '../types';

const unwrap = <T,>(response: { data: unknown }): T => ((response.data as { data?: T }).data ?? response.data) as T;

export default function AiAnalyzerPage() {
  const dispatch = useAppDispatch();
  const { atsResult, analyzing, error } = useAI();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const analyze = async () => {
    dispatch(setError(null));
    dispatch(setAnalyzing({ feature: 'ats', value: true }));
    try {
      const response = await aiApi.analyzeResume(resumeText, jobDescription);
      dispatch(setAtsResult(unwrap<ResumeAnalysis>(response)));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Unable to analyze resume'));
    } finally {
      dispatch(setAnalyzing({ feature: 'ats', value: false }));
    }
  };

  return (
    <div className="app-container grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="card space-y-4">
        <div><h2 className="text-lg font-bold">Inputs</h2><p className="text-sm text-slate-500">Paste a resume and a target job description.</p></div>
        <div><label className="label">Resume text</label><textarea className="input min-h-56" value={resumeText} onChange={(event) => setResumeText(event.target.value)} /></div>
        <div><label className="label">Job description</label><textarea className="input min-h-56" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} /></div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="button" className="btn-primary inline-flex w-full items-center justify-center gap-2" onClick={analyze} disabled={!resumeText || !jobDescription || analyzing.ats}>
          <HiOutlineSparkles className="h-5 w-5" /> Analyze
        </button>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold">Results</h2>
        {analyzing.ats ? (
          <div className="flex min-h-96 items-center justify-center"><LoadingSpinner size="lg" label="Analyzing resume" /></div>
        ) : atsResult ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-5">
              <div className="grid h-28 w-28 place-items-center rounded-full border-8 border-blue-500 text-3xl font-extrabold text-slate-950">{atsResult.score}</div>
              <div><p className="text-xl font-bold">ATS Score</p><p className="text-sm text-slate-500">Higher scores indicate stronger alignment with the job description.</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ResultList title="Strengths" items={atsResult.strengths} tone="green" />
              <ResultList title="Missing skills" items={atsResult.missingSkills} tone="red" />
              <ResultList title="Improvements" items={atsResult.improvements} tone="blue" />
            </div>
          </div>
        ) : (
          <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">Run an analysis to see score, gaps, and suggestions.</div>
        )}
      </section>
    </div>
  );
}

function ResultList({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'red' | 'blue' }) {
  const color = tone === 'green' ? 'bg-green-50 text-green-700' : tone === 'red' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700';
  return <div><h3 className="mb-2 font-semibold">{title}</h3><div className="space-y-2">{items?.map((item) => <p key={item} className={`rounded-lg px-3 py-2 text-sm ${color}`}>{item}</p>)}</div></div>;
}
