'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/src/context/ToastContext';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      const msg = 'नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए (Password must be at least 8 characters)';
      setErrorMessage(msg);
      toastError(msg, 'कमजोर पासवर्ड');
      return;
    }
    if (password !== confirmPassword) {
      const msg = 'दोनों पासवर्ड मेल नहीं खाते (Passwords do not match)';
      setErrorMessage(msg);
      toastError(msg, 'पासवर्ड बेमेल');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        const msg = error.message || 'पासवर्ड अपडेट करने में त्रुटि। कृपया पुनः प्रयास करें।';
        setErrorMessage(msg);
        toastError(msg, 'त्रुटि');
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      toastSuccess('पासवर्ड सफलतापूर्वक अपडेट किया गया!', 'सफल');
      setTimeout(() => {
        router.refresh();
        router.replace('/dashboard');
      }, 2000);
    } catch (err: any) {
      const msg = err?.message || 'पासवर्ड अपडेट करने में असमर्थ।';
      setErrorMessage(msg);
      toastError(msg, 'त्रुटि');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            नया पासवर्ड बनाएं | Set New Password
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            कृपया अपने खाते के लिए एक नया और मजबूत पासवर्ड दर्ज करें
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

          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                पासवर्ड सफलतापूर्वक बदला गया!
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                आपका नया पासवर्ड सुरक्षित रूप से सहेज लिया गया है। आपको डैशबोर्ड पर भेजा जा रहा है...
              </p>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                >
                  <span>डैशबोर्ड पर जाएं (Go to Dashboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  नया पासवर्ड (New Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 pl-1">
                  कम से कम 8 अक्षर (Minimum 8 characters)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  नए पासवर्ड की पुष्टि (Confirm New Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>पासवर्ड अपडेट करें (Update Password)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
