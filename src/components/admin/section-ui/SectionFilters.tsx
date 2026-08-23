'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { DatePicker } from '@/src/components/inputs/DatePicker';

export const FilterBar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <Card className={cn('p-3 flex flex-wrap items-center gap-2.5', className)}>{children}</Card>
);

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9"
    />
  </div>
);

/**
 * The dropdown every filter bar uses.
 *
 * Each section had this select inlined with the same forty-character class
 * string repeated per filter — three times in members alone — so a change to
 * the filter styling meant finding all of them.
 */
export const FilterSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  'aria-label': string;
}> = ({ value, onChange, options, 'aria-label': ariaLabel }) => (
  <select
    aria-label={ariaLabel}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

/** Date filter with the clear affordance the sections all hand-rolled. */
export const FilterDate: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <div className="w-40 relative">
    <DatePicker value={value} onChange={onChange} placeholder={placeholder} lang="en" className="py-2 text-xs" />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
        title="Clear date"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);
