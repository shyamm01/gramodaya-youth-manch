'use client';

import React from 'react';
import { KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../../ui';
import { useApp } from '../../../context/AppContext';

interface JoinStepOtpProps {
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
}

export const JoinStepOtp: React.FC<JoinStepOtpProps> = ({
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
}) => {
  const { t, lang } = useApp();

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Informational Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {lang === 'en' ? 'Secure OTP Verification' : 'सुरक्षित मोबाइल ओटीपी प्रमाणीकरण'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'en'
              ? 'We will send a 6-digit verification code to your phone.'
              : 'आपके नंबर पर ६-अंकों का सत्यापन कोड भेजा जाएगा।'}
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
        <div className="space-y-3 pt-2 animate-in fade-in duration-150">
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
  );
};
