import type { IconType } from 'react-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  accent?: string;
}

export default function StatCard({ label, value, icon: Icon, accent = 'bg-blue-100 text-blue-700' }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`rounded-lg p-3 ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-950">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
