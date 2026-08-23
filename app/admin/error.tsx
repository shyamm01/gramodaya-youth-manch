'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

/**
 * Error boundary for the admin segment.
 *
 * Scoped to the content area, so one section throwing leaves the sidebar and
 * top bar usable and the operator can navigate elsewhere instead of meeting a
 * blank page. Without this the nearest boundary is the root one, which takes
 * the whole app down.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto py-12 text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          This section failed to load
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          {error.message || 'An unexpected error occurred while rendering this screen.'}
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-600">
            Reference: {error.digest}
          </p>
        )}
      </div>
      <Button size="sm" onClick={reset}>
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Try again
      </Button>
    </div>
  );
}
