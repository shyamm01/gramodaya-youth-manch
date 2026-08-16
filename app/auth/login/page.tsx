'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/src/context/ToastContext';
import { useApp } from '@/src/context/AppContext';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const queryMessage = searchParams.get('message');
  const queryError = searchParams.get('error');

  const { lang } = useApp();
  const isEn = lang === 'en';

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(queryError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(queryMessage || null);

  const supabase = createClient();

  useEffect(() => {
    async function checkCurrentSession() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace(next);
      }
    }
    checkCurrentSession();
  }, [router, next, supabase]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = isEn ? 'Please enter a valid email address' : 'कृपया एक वैध ईमेल पता दर्ज करें';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Invalid Email' : 'अमान्य ईमेल');
      return;
    }
    if (!password || password.length < 6) {
      const msg = isEn ? 'Password must be at least 6 characters' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए';
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Invalid Password' : 'अमान्य पासवर्ड');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        let userMsg = error.message || (isEn ? 'Login failed. Please try again.' : 'लॉगिन विफल रहा। कृपया पुनः प्रयास करें।');
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          userMsg = isEn ? 'Invalid email or password. Please check your credentials.' : 'गलत ईमेल या पासवर्ड। कृपया पुनः जांचें।';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          userMsg = isEn ? 'Email not verified. Please check your inbox.' : 'आपका ईमेल अभी सत्यापित नहीं है। कृपया अपना इनबॉक्स जांचें।';
        }
        setErrorMessage(userMsg);
        toastError(userMsg, isEn ? 'Login Error' : 'लॉगिन त्रुटि');
        setLoading(false);
        return;
      }

      if (data.session) {
        const succMsg = isEn ? 'Login successful!' : 'सफलतापूर्वक लॉग इन किया गया!';
        setSuccessMessage(succMsg);
        toastSuccess(succMsg, isEn ? 'Welcome' : 'स्वागत है!');
        router.refresh();
        router.replace(next);
      }
    } catch (err: any) {
      const errTxt = err?.message || (isEn ? 'An unexpected error occurred. Please try again.' : 'अपेक्षित त्रुटि हुई। कृपया थोड़ी देर बाद पुनः प्रयास करें।');
      setErrorMessage(errTxt);
      toastError(errTxt, isEn ? 'Error' : 'त्रुटि');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setOauthLoading(true);
    toastInfo(isEn ? 'Redirecting to Google Authentication...' : 'गूगल प्रमाणीकरण पृष्ठ पर भेजा जा रहा है...', 'Google OAuth');

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        const msg = error.message || (isEn ? 'Failed to initiate Google Login.' : 'गूगल लॉगिन आरंभ करने में त्रुटि।');
        setErrorMessage(msg);
        toastError(msg, 'OAuth');
        setOauthLoading(false);
      }
    } catch (err: any) {
      const msg = err?.message || (isEn ? 'Google authentication could not be started.' : 'गूगल ऑथेंटिकेशन प्रारंभ नहीं हो सका।');
      setErrorMessage(msg);
      toastError(msg, isEn ? 'Error' : 'त्रुटि');
      setOauthLoading(false);
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
            {isEn ? 'Welcome Back' : 'स्वागत है'}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            {isEn
              ? 'Sign in to continue to Gramodaya Youth Manch'
              : 'ग्रामोदय यूथ मंच में जारी रखने के लिए साइन इन करें'}
          </p>
        </div>

        {/* Main Form Box */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-stone-900/5 dark:shadow-black/40">
          {/* Notifications */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500/70 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold rounded-2xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {oauthLoading ? (
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isEn ? 'Continue with Google' : 'गूगल के साथ जारी रखें'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
            <span className="flex-shrink mx-4 text-xs uppercase font-semibold text-stone-400 dark:text-stone-500 tracking-wider">
              {isEn ? 'OR WITH EMAIL' : 'या ईमेल द्वारा'}
            </span>
            <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                {isEn ? 'Email Address' : 'ईमेल पता'}
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {isEn ? 'Password' : 'पासवर्ड'}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  {isEn ? 'Forgot password?' : 'पासवर्ड भूल गए?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEn ? 'Enter password' : 'पासवर्ड दर्ज करें'}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isEn ? 'Sign In' : 'साइन इन करें'}</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to sign up */}
          <div className="mt-8 text-center pt-6 border-t border-stone-100 dark:border-stone-800/80">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {isEn ? "Don't have an account?" : 'खाता नहीं है?'}{' '}
              <Link
                href={`/auth/signup?next=${encodeURIComponent(next)}`}
                className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 inline-flex items-center gap-1 hover:underline ml-1"
              >
                {isEn ? 'Create Account' : 'नया खाता बनाएं'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
