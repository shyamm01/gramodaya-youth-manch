'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[95vw]',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with blur and dark mode awareness */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white dark:bg-[#131B2E] border border-[#E0DCCF] dark:border-slate-800 shadow-2xl z-10 my-8 overflow-hidden animate-scale-in text-[#2C3327] dark:text-slate-100 transition-colors',
          maxWidthMap[maxWidth],
          className
        )}
      >
        {/* Header if title is present */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#E0DCCF] dark:border-slate-800">
            <div className="space-y-1 pr-6">
              {title && (
                <h2 className="text-base sm:text-lg font-black text-[#2C3327] dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8C8675] dark:text-slate-400 hover:bg-[#F0EDE4] dark:hover:bg-slate-800 hover:text-[#2C3327] dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
