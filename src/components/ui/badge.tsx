'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'emerald';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default:
      'border-transparent bg-[#1E3A2F] text-white dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
    secondary:
      'border-transparent bg-[#F0EDE4] text-[#2C3327] dark:bg-slate-800 dark:text-slate-300',
    destructive:
      'border-transparent bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    outline: 'border border-[#E0DCCF] dark:border-slate-700 text-[#2C3327] dark:text-slate-300',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
    warning:
      'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
    emerald:
      'border-emerald-300 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
