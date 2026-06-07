import { HiOutlineXMark } from 'react-icons/hi2';

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close modal">
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
