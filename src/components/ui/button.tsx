'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'emerald'
    | 'amber';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-[#1E3A2F] text-white hover:bg-[#142820] dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white shadow-xs',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 shadow-xs',
      outline:
        'border border-[#E0DCCF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#2C3327] dark:text-slate-200 hover:bg-[#F7F5F0] dark:hover:bg-slate-700 shadow-2xs',
      secondary:
        'bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-slate-200 hover:bg-[#E2DDD2] dark:hover:bg-slate-700',
      ghost:
        'hover:bg-[#F0EDE4] dark:hover:bg-slate-800 text-[#2C3327] dark:text-slate-200',
      link: 'text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline p-0 h-auto',
      emerald:
        'bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-xs',
      amber:
        'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700 shadow-xs',
    };

    const sizeStyles = {
      default: 'h-9 px-4 py-2 text-xs font-bold rounded-xl',
      xs: 'h-6 px-2 text-[10px] font-bold rounded-md',
      sm: 'h-8 px-3 text-xs font-bold rounded-lg',
      lg: 'h-11 px-6 text-sm font-extrabold rounded-xl',
      icon: 'h-9 w-9 rounded-xl p-0 flex items-center justify-center',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
