'use client';

import React, { useState } from 'react';
import { Phone, Mail, Lock, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../../ui';
import { useApp } from '../../../context/AppContext';

interface JoinStepCredentialsProps {
  mobile: string;
  setMobile: (m: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (cp: string) => void;
  onNext: (e: React.FormEvent) => void;
}

export const JoinStepCredentials: React.FC<JoinStepCredentialsProps> = ({
  mobile,
  setMobile,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onNext,
}) => {
  const { lang } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
  const isMobileValid = cleanDigits.length === 10;
  const isPasswordValid = password.length >= 6;
  const isPasswordMatching = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <form onSubmit={onNext} className="space-y-4 animate-in fade-in duration-200">
      {/* Informative Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {lang === 'en' ? 'Create Secure Account' : 'सुरक्षित सदस्य खाता बनाएं'}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'en'
              ? 'Enter your mobile number and password for direct login.'
              : 'सीधे लॉगिन हेतु अपना मोबाइल नंबर एवं गुप्त पासवर्ड दर्ज करें।'}
          </p>
        </div>
      </div>

      {/* Mobile Input Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {lang === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 select-none pointer-events-none">
            +91
          </span>
          <Input
            type="tel"
            required
            maxLength={14}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="98765 43210"
            className="pl-11 h-10 text-xs font-mono rounded-lg"
            autoFocus
          />
        </div>
      </div>

      {/* Email Input Field (Optional) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{lang === 'en' ? 'Email Address' : 'ईमेल पता'}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({lang === 'en' ? 'Optional' : 'वैकल्पिक'})
          </span>
        </label>
        <div className="relative">
          <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={lang === 'en' ? 'name@example.com' : 'उदा. rahul@example.com'}
            className="pl-9 h-10 text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {lang === 'en' ? 'Create Password' : 'पासवर्ड बनाएं'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400">
            {lang === 'en' ? 'Min 6 characters' : 'कम से कम ६ अक्षर'}
          </span>
        </div>
        <div className="relative">
          <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-9 pr-10 h-10 text-xs rounded-lg"
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

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {lang === 'en' ? 'Confirm Password' : 'पासवर्ड की पुष्टि करें'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          {isPasswordMatching && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-3 h-3" />
              {lang === 'en' ? 'Matched' : 'समान है'}
            </span>
          )}
        </div>
        <div className="relative">
          <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-9 pr-10 h-10 text-xs rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isMobileValid || !isPasswordValid || password !== confirmPassword}
        className="w-full h-10.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-colors mt-2"
      >
        <span>{lang === 'en' ? 'Continue to Personal Details' : 'आगे बढ़ें (व्यक्तिगत विवरण)'}</span>
      </Button>
    </form>
  );
};
