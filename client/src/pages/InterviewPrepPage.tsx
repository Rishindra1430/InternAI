import { useState } from 'react';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { aiApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAppDispatch, useAI } from '../hooks';
import { setAnalyzing, setError, setInterviewPrepResult } from '../store/slices/aiSlice';
import type { InterviewPrepResult } from '../types';

const unwrap = <T,>(response: { data: unknown }): T => ((response.data as { data?: T }).data ?? response.data) as T;

export default function InterviewPrepPage() {
  const dispatch = useAppDispatch();
  const { interviewPrepResult, analyzing, error } = useAI();
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');

  const generate = async () => {
    dispatch(setError(null));
    dispatch(setAnalyzing({ feature: 'interview', value: true }));
    try {
      const response = await aiApi.interviewPrep(jobDescription, resumeText, companyName);
      dispatch(setInterviewPrepResult(unwrap<InterviewPrepResult>(response)));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Unable to generate questions'));
    } finally {
      dispatch(setAnalyzing({ feature: 'interview', value: false }));
    }
  };

  return (
    <div className="app-container grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="card space-y-4">
        <div><h2 className="text-lg font-bold">Interview Inputs</h2><p className="text-sm text-slate-500">Generate targeted behavioral, technical, and company questions.</p></div>
        <div><label className="label">Company</label><input className="input" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></div>
        <div><label className="label">Job description</label><textarea className="input min-h-44" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} /></div>
        <div><label className="label">Resume text</label><textarea className="input min-h-44" value={resumeText} onChange={(event) => setResumeText(event.target.value)} /></div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="button" className="btn-primary inline-flex w-full items-center justify-center gap-2" onClick={generate} disabled={!jobDescription || analyzing.interview}>
          <HiOutlineChatBubbleLeftRight className="h-5 w-5" /> Generate Questions
        </button>
      </section>
      <section className="card">
        <h2 className="text-lg font-bold">Question Set</h2>
        {analyzing.interview ? <div className="flex min-h-96 items-center justify-center"><LoadingSpinner size="lg" label="Generating questions" /></div> : interviewPrepResult ? (
          <div className="mt-5 grid gap-4">
            <QuestionGroup title="Technical" questions={interviewPrepResult.technicalQuestions} />
            <QuestionGroup title="HR" questions={interviewPrepResult.hrQuestions} />
            <QuestionGroup title="Company Specific" questions={interviewPrepResult.companySpecificQuestions} />
          </div>
        ) : <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">Generate questions to begin interview prep.</div>}
      </section>
    </div>
  );
}

function QuestionGroup({ title, questions }: { title: string; questions: string[] }) {
  return <div><h3 className="mb-2 font-semibold text-slate-950">{title}</h3><div className="space-y-2">{questions?.map((question) => <details key={question} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><summary className="cursor-pointer font-medium text-slate-800">{question}</summary><p className="mt-2 text-sm text-slate-500">Use a concise STAR-style answer, connect it to the role, and close with what you learned.</p></details>)}</div></div>;
}
