import { useEffect, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  delay?: number;
}

export default function SearchBar({ value = '', placeholder = 'Search', onChange, delay = 250 }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => onChange(localValue), delay);
    return () => window.clearTimeout(timer);
  }, [delay, localValue, onChange]);

  return (
    <div className="relative">
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        className="input pl-10 pr-10"
        value={localValue}
        placeholder={placeholder}
        onChange={(event) => setLocalValue(event.target.value)}
      />
      {localValue ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
          onClick={() => setLocalValue('')}
          aria-label="Clear search"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
