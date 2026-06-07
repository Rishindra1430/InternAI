import { HiOutlineArrowPath } from 'react-icons/hi2';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-500">
      <HiOutlineArrowPath className={`${sizes[size]} animate-spin`} />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}
