'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, LogIn, Home, RefreshCw } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';
  const errorDescription = searchParams.get('error_description');

  const getErrorMessage = () => {
    if (errorDescription) return errorDescription;
    switch (reason) {
      case 'callback_failed':
        return 'ऑथेंटिकेशन कोड का सत्यापन नहीं हो सका या लिंक की समय सीमा समाप्त हो चुकी है।';
      case 'oauth_failed':
        return 'गूगल या तीसरे पक्ष के माध्यम से साइन इन करने में समस्या आई।';
      case 'session_expired':
        return 'आपका सत्र समाप्त हो चुका है। कृपया पुनः साइन इन करें।';
      default:
        return 'ऑथेंटिकेशन प्रक्रिया के दौरान एक अज्ञात त्रुटि हुई। कृपया पुनः प्रयास करें।';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
            प्रमाणीकरण त्रुटि | Authentication Error
          </h1>

          <p className="text-sm text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">
            {getErrorMessage()}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>पुनः साइन इन करें (Sign In)</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold text-sm transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>मुख्य पृष्ठ (Home)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
