'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/src/context/ToastContext';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'कृपया एक वैध ईमेल पता दर्ज करें (Please enter a valid email address)';
      setErrorMessage(msg);
      toastError(msg, 'अमान्य ईमेल');
      return;
    }

    setLoading(true);
    toastInfo('पासवर्ड रीसेट लिंक भेजा जा रहा है...', 'प्रक्रिया जारी');

    try {
      const redirectTo = `${window.location.origin}/auth/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error) {
        const msg = error.message || 'पासवर्ड रीसेट अनुरोध भेजने में त्रुटि।';
        setErrorMessage(msg);
        toastError(msg, 'त्रुटि');
        setLoading(false);
        return;
      }

      // Neutral success to prevent account enumeration (PRD Section 26)
      setIsSubmitted(true);
      toastSuccess('यदि ईमेल पंजीकृत है, तो रीसेट लिंक भेज दिया गया है।', 'लिंक प्रेषित');
    } catch (err: any) {
      const msg = err?.message || 'अनुरोध विफल रहा। कृपया बाद में प्रयास करें।';
      setErrorMessage(msg);
      toastError(msg, 'त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            पासवर्ड रीसेट | Reset Password
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            अपना ईमेल दर्ज करें और हम आपको पासवर्ड रीसेट लिंक भेजेंगे
          </p>
        </div>

        {/* Main Box */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-stone-900/5 dark:shadow-black/40">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {isSubmitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                रीसेट लिंक भेजा गया (Reset Link Sent)
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                यदि <strong className="text-stone-800 dark:text-stone-200">{email}</strong> पंजीकृत है, तो आपको पासवर्ड बदलने के लिए एक लिंक प्राप्त होगा। कृपया अपना इनबॉक्स और स्पैम फ़ोल्डर जांचें।
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>लॉगिन पृष्ठ पर वापस जाएं (Back to Login)</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  पंजीकृत ईमेल (Registered Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>रीसेट लिंक भेजें (Send Reset Link)</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          {!isSubmitted && (
            <div className="mt-8 text-center pt-6 border-t border-stone-100 dark:border-stone-800/80">
              <Link
                href="/auth/login"
                className="font-medium text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>साइन इन पर वापस जाएं (Back to Sign in)</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
