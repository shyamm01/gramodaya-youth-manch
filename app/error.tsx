'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from '@/src/context/ToastContext';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
    toast.error(error.message || 'पृष्ठ लोड करने में त्रुटि हुई', 'त्रुटि (Error)');
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
          कुछ गलत हुआ | Something went wrong
        </h1>

        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
          {error.message || 'तकनीकी त्रुटि के कारण पृष्ठ प्रदर्शित नहीं हो सका। कृपया पुनः प्रयास करें।'}
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-stone-400 dark:text-stone-500 mb-6 select-all">
            त्रुटि ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>पुनः प्रयास करें (Try Again)</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>मुख्य पृष्ठ (Home)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
