'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  required?: boolean;
  lang?: 'hi' | 'en' | string;
  placement?: 'auto' | 'top' | 'bottom';
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_HI = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder,
  className,
  minYear = 1940,
  maxYear = new Date().getFullYear() + 5,
  disabled = false,
  required = false,
  lang = 'hi',
  placement = 'auto',
}) => {
  const isEnglish = lang === 'en';
  const monthNames = isEnglish ? MONTHS_EN : MONTHS_HI;
  const dayNames = isEnglish ? DAYS_EN : DAYS_HI;

  const [isOpen, setIsOpen] = useState(false);
  const [actualPlacement, setActualPlacement] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    return null;
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // Calculate dynamic placement when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (placement === 'top') {
        setActualPlacement('top');
      } else if (placement === 'bottom') {
        setActualPlacement('bottom');
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 320 && spaceAbove > 320) {
          setActualPlacement('top');
        } else {
          setActualPlacement('bottom');
        }
      }
    }
  }, [isOpen, placement]);

  // Sync view when value changes from outside
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format display text
  const displayString = useMemo(() => {
    if (!parsedDate) return '';
    const d = parsedDate.getDate();
    const m = monthNames[parsedDate.getMonth()];
    const y = parsedDate.getFullYear();
    return `${d} ${m} ${y}`;
  }, [parsedDate, monthNames]);

  // Generate Year options list
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [minYear, maxYear]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar Grid Days Calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setViewYear(yyyy);
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* ── TRIGGER INPUT BUTTON ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-9.5 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 transition-all text-left cursor-pointer hover:border-emerald-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-500',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'ring-1 ring-emerald-500 border-emerald-500',
          className
        )}
        aria-label="Select Date"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span
            className={cn(
              'truncate font-medium',
              !displayString && 'text-slate-400 dark:text-slate-500'
            )}
          >
            {displayString || placeholder || (isEnglish ? 'Select Date...' : 'तारीख चुनें...')}
          </span>
        </div>

        {value ? (
          <span
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title={isEnglish ? 'Clear' : 'हटाएं'}
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">▼</span>
        )}
      </button>

      {/* Hidden input for form requirement validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* ── DATEPICKER POPUP DROPDOWN ── */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 z-[100] w-72 sm:w-76 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150',
            actualPlacement === 'top'
              ? 'bottom-full mb-1.5'
              : 'top-full mt-1.5'
          )}
        >
          {/* Header Controls (Month & Year Selectors) */}
          <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isEnglish ? 'Previous Month' : 'पिछला माह'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white rounded-md px-1.5 py-0.5 outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white rounded-md px-1.5 py-0.5 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isEnglish ? 'Next Month' : 'अगला माह'}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 pt-2 pb-1 text-center">
            {dayNames.map((d, i) => (
              <span
                key={d}
                className={cn(
                  'text-[10px] font-bold uppercase',
                  i === 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                parsedDate &&
                parsedDate.getFullYear() === viewYear &&
                parsedDate.getMonth() === viewMonth &&
                parsedDate.getDate() === dayNum;

              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === dayNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={cn(
                    'h-7 w-7 mx-auto rounded-lg text-xs font-semibold transition-all flex items-center justify-center cursor-pointer',
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isToday
                      ? 'border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {isEnglish ? 'Today' : 'आज की तारीख'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              {isEnglish ? 'Close' : 'बंद करें'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
