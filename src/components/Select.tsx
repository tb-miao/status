import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  className?: string;
  'aria-label'?: string;
}

export function Select({ value, options, onChange, className = '', 'aria-label': ariaLabel }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center justify-between gap-2 px-3 py-2 min-w-[90px]
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700 
                   rounded-lg text-sm text-slate-700 dark:text-slate-200
                   hover:border-slate-300 dark:hover:border-slate-600
                   focus:outline-none focus:ring-2 focus:ring-green-500/50
                   transition-colors"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-1 w-full min-w-[120px]
                      bg-white dark:bg-slate-800 
                      border border-slate-200 dark:border-slate-700 
                      rounded-lg shadow-lg overflow-hidden"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors
                ${option.value === value 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
