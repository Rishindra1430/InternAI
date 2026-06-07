import type { IconType } from 'react-icons';
import { HiOutlineInbox } from 'react-icons/hi2';

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = HiOutlineInbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <Icon className="mb-3 h-10 w-10 text-slate-300" />
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
