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
    <div ref={ref} className={`relative group ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center justify-between gap-2 px-4 py-2.5 min-w-[90px]
                   bg-white/50 dark:bg-slate-800/50 
                   border border-slate-200/50 dark:border-slate-700/30 
                   rounded-xl text-sm text-slate-700 dark:text-slate-200
                   hover:border-slate-300/70 dark:hover:border-slate-600/50
                   focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50
                   backdrop-blur-sm transition-all duration-200
                   shadow-sm hover:shadow-md group-hover:scale-[1.02]"
      >
        <span className="truncate font-medium">{selectedOption?.label}</span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`}
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
          className="absolute z-50 mt-2 w-full min-w-[120px]
                      bg-white/80 dark:bg-slate-800/80 
                      border border-slate-200/50 dark:border-slate-700/30 
                      rounded-xl shadow-xl backdrop-blur-md overflow-hidden
                      animate-slide-down origin-top"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-all duration-200
                ${option.value === value 
                  ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium' 
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
                }
                hover:pl-5 hover:scale-[1.01] active:scale-95
                border-b border-slate-100/50 dark:border-slate-700/20 last:border-b-0
                animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}