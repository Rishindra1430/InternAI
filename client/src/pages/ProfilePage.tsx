import { useState } from 'react';
import { HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2';
import { useAuth } from '../hooks';
import { getInitials } from '../utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [skill, setSkill] = useState('');
  const [saved, setSaved] = useState(false);

  const addSkill = () => {
    const value = skill.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkill('');
  };

  return (
    <div className="app-container space-y-6">
      <section className="card flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan-100 text-xl font-bold text-cyan-700">{getInitials(name || 'User')}</div>
        <div><h2 className="text-2xl font-bold text-slate-950">{name || 'Candidate'}</h2><p className="text-sm text-slate-500">{user?.email}</p></div>
      </section>
      {saved ? <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">Profile changes saved locally.</div> : null}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h3 className="text-lg font-bold">Personal Info</h3>
          <div><label className="label">Name</label><input className="input" value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div><label className="label">Email</label><input className="input bg-slate-100" value={user?.email ?? ''} readOnly /></div>
          <div><label className="label">Bio</label><textarea className="input min-h-32" placeholder="Short career summary" /></div>
          <button type="button" className="btn-primary" onClick={() => setSaved(true)}>Save profile</button>
        </div>
        <div className="card space-y-4">
          <h3 className="text-lg font-bold">Skills</h3>
          <div className="flex gap-2">
            <input className="input" value={skill} onChange={(event) => setSkill(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }} />
            <button type="button" className="btn-primary px-3" onClick={addSkill} aria-label="Add skill"><HiOutlinePlus className="h-5 w-5" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((item) => <span key={item} className="badge bg-slate-100 text-slate-700">{item}<button type="button" className="ml-2" onClick={() => setSkills(skills.filter((skillItem) => skillItem !== item))} aria-label={`Remove ${item}`}><HiOutlineXMark className="h-4 w-4" /></button></span>)}
          </div>
        </div>
      </section>
    </div>
  );
}
