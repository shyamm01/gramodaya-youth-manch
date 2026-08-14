'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Lock,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button, Input } from '../../ui';
import { GoogleIcon, FacebookIcon } from '../../common';
import { useApp } from '../../../context/AppContext';
import { signInWithOAuthProvider } from '../../../lib/supabase';
import { cn } from '@/src/lib/utils';

export type JoinAuthMethod = 'otp' | 'password' | 'oauth';

interface JoinStepAuthProps {
  authMethod: JoinAuthMethod;
  setAuthMethod: (m: JoinAuthMethod) => void;

  // OTP Fields
  mobile: string;
  setMobile: (m: string) => void;
  otpCode: string;
  setOtpCode: (c: string) => void;
  isOtpSent: boolean;
  setIsOtpSent: (v: boolean) => void;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  resendTimer: number;
  isMobileValid: boolean;
  onSendOtp: () => Promise<void>;
  onVerifyOtp: () => Promise<void>;

  // Password Fields
  emailOrMobile: string;
  setEmailOrMobile: (em: string) => void;
  password: string;
  setPassword: (p: string) => void;
  onVerifyPasswordAccount: (e: React.FormEvent) => void;

  // OAuth Handler
  onOAuthSuccess: (provider: string, email?: string, name?: string) => void;
}

export const JoinStepAuth: React.FC<JoinStepAuthProps> = ({
  authMethod,
  setAuthMethod,
  mobile,
  setMobile,
  otpCode,
  setOtpCode,
  isOtpSent,
  setIsOtpSent,
  isSendingOtp,
  isVerifyingOtp,
  resendTimer,
  isMobileValid,
  onSendOtp,
  onVerifyOtp,
  emailOrMobile,
  setEmailOrMobile,
  password,
  setPassword,
  onVerifyPasswordAccount,
  onOAuthSuccess,
}) => {
  const { t, lang } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [oAuthError, setOAuthError] = useState('');

  const handleOAuthClick = async (provider: 'google' | 'facebook') => {
    setIsOAuthLoading(provider);
    setOAuthError('');
    try {
      const res = await signInWithOAuthProvider(provider);
      if (res.success) {
        onOAuthSuccess(provider);
      } else {
        const isNotEnabled =
          (res.error || '').toLowerCase().includes('not enabled') ||
          (res.error || '').toLowerCase().includes('validation_failed') ||
          (res.error || '').toLowerCase().includes('unsupported provider');

        if (isNotEnabled) {
          setOAuthError(
            lang === 'en'
              ? `${provider.toUpperCase()} OAuth provider is not yet enabled in the Supabase Dashboard (Authentication → Providers).`
              : `${provider === 'google' ? 'गूगल (Google)' : 'फेसबुक (Facebook)'} ऑथ प्रदाता अभी सुपबेस प्रोजेक्ट में सक्षम (Enabled) नहीं है।`
          );
        } else {
          setOAuthError(res.error || 'OAuth Authentication failed.');
        }
      }
    } catch (e: any) {
      setOAuthError(e?.message || 'OAuth login error');
    } finally {
      setIsOAuthLoading(null);
    }
  };

  const handleContinueWithDemoSocial = (provider: 'google' | 'facebook') => {
    setOAuthError('');
    onOAuthSuccess(
      provider,
      provider === 'google' ? 'social_user@gmail.com' : 'social_user@facebook.com',
      provider === 'google' ? 'Google User' : 'Facebook User'
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── AUTH METHOD SELECTOR TABS ── */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setAuthMethod('otp')}
          className={cn(
            'py-2 px-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
            authMethod === 'otp'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="truncate">{lang === 'en' ? 'Mobile OTP' : 'मोबाइल ओटीपी'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthMethod('password')}
          className={cn(
            'py-2 px-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
            authMethod === 'password'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="truncate">{lang === 'en' ? 'Password' : 'पासवर्ड'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAuthMethod('oauth')}
          className={cn(
            'py-2 px-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer',
            authMethod === 'oauth'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="truncate">{lang === 'en' ? 'Google / FB' : 'सोशल लॉगिन'}</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. METHOD: MOBILE NUMBER & OTP VERIFICATION                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {authMethod === 'otp' && (
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Instant Mobile OTP Verification' : 'त्वरित मोबाइल ओटीपी सत्यापन'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'We will send a 6-digit verification code to your mobile.'
                  : 'आपके मोबाइल नंबर पर ६-अंकीय ओटीपी कोड भेजा जाएगा।'}
              </p>
            </div>
          </div>

          {/* Mobile Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('join.mobile')} <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500 select-none pointer-events-none">
                  +91
                </span>
                <Input
                  type="tel"
                  required
                  maxLength={14}
                  value={mobile}
                  disabled={isOtpSent}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
                  className="pl-10 h-10 text-xs font-mono rounded-lg"
                  autoFocus={!isOtpSent}
                />
              </div>
              {!isOtpSent ? (
                <Button
                  type="button"
                  onClick={onSendOtp}
                  disabled={!isMobileValid || isSendingOtp}
                  className="h-10 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {isSendingOtp ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : lang === 'en' ? (
                    'Send OTP'
                  ) : (
                    'ओटीपी भेजें'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpCode('');
                  }}
                  className="h-10 px-3 text-xs rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  {lang === 'en' ? 'Change' : 'बदलें'}
                </Button>
              )}
            </div>
          </div>

          {/* OTP Input Field */}
          {isOtpSent && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {lang === 'en' ? 'Enter 6-Digit OTP Code' : '६-अंकीय ओटीपी कोड दर्ज करें'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  {resendTimer > 0 ? (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {lang === 'en' ? `Resend in ${resendTimer}s` : `${resendTimer}s बाद पुनः भेजें`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onSendOtp}
                      disabled={isSendingOtp}
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {lang === 'en' ? 'Resend OTP' : 'ओटीपी पुनः भेजें'}
                    </button>
                  )}
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="h-10 text-center tracking-widest text-sm font-mono font-bold rounded-lg"
                  autoFocus
                />
              </div>

              <Button
                type="button"
                onClick={onVerifyOtp}
                disabled={isVerifyingOtp || otpCode.trim().length < 6}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                {isVerifyingOtp ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {lang === 'en' ? 'Verifying OTP...' : 'सत्यापित किया जा रहा है...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'en' ? 'Verify OTP & Continue' : 'सत्यापित करें एवं आगे बढ़ें'}
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. METHOD: MOBILE/EMAIL & PASSWORD                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {authMethod === 'password' && (
        <form onSubmit={onVerifyPasswordAccount} className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Register with Mobile/Email & Password' : 'मोबाइल/ईमेल और पासवर्ड द्वारा खाता बनाएं'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'Set a secure password for future logins.'
                  : 'भविष्य में लॉगिन करने हेतु अपना सुरक्षित पासवर्ड बनाएं।'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Mobile Number or Email Address' : 'मोबाइल नंबर या ईमेल पता'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                required
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder={lang === 'en' ? '9876543210 or name@example.com' : 'उदा. 9876543210 या नाम@ईमेल.com'}
                className="h-10 text-xs rounded-lg pl-3.5"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Create Password (min. 6 characters)' : 'गुप्त पासवर्ड बनाएं (न्यूनतम ६ अक्षर)'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-xs rounded-lg pr-10 pl-3.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!emailOrMobile.trim() || password.length < 6}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <span>{lang === 'en' ? 'Continue to Personal Details' : 'आगे बढ़ें (व्यक्तिगत विवरण)'}</span>
          </Button>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. METHOD: OAUTH (GOOGLE & FACEBOOK)                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {authMethod === 'oauth' && (
        <div className="space-y-3.5">
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'One-Click Social Account Registration' : 'एक-क्लिक सोशल मीडिया खाता पंजीकरण'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'Connect seamlessly with your Google or Facebook account.'
                  : 'अपने गूगल या फेसबुक खाते से तुरंत जुड़ें।'}
              </p>
            </div>
          </div>

          {/* OAuth Error Alert if Provider is not configured in Supabase */}
          {oAuthError && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold leading-tight">{oAuthError}</p>
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80">
                    {lang === 'en'
                      ? 'Tip: To enable Google/FB login in production, add Client ID & Secret in Supabase Dashboard -> Authentication -> Providers.'
                      : 'सुझाव: प्रोडक्शन में गूगल/एफबी लॉगिन चालू करने हेतु सुपबेस डैशबोर्ड (Auth → Providers) में क्लाइंट आईडी दर्ज करें।'}
                  </p>
                </div>
              </div>

              {/* Development / Testing quick continue */}
              <div className="pt-1 flex items-center justify-end gap-2 border-t border-amber-200 dark:border-amber-900/60">
                <button
                  type="button"
                  onClick={() => handleContinueWithDemoSocial('google')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                >
                  {lang === 'en' ? 'Continue with Demo Profile' : 'डेमो प्रोफ़ाइल से जारी रखें'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthClick('google')}
              disabled={Boolean(isOAuthLoading)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer active:scale-98"
            >
              {isOAuthLoading === 'google' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <GoogleIcon size={18} />
              )}
              <span>{lang === 'en' ? 'Continue with Google' : 'गूगल (Google) से जारी रखें'}</span>
            </button>

            {/* Facebook OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthClick('facebook')}
              disabled={Boolean(isOAuthLoading)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer active:scale-98"
            >
              {isOAuthLoading === 'facebook' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <FacebookIcon size={18} />
              )}
              <span>{lang === 'en' ? 'Continue with Facebook' : 'फेसबुक (Facebook) से जारी रखें'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
