'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import { Input } from '../../ui';
import { useApp } from '../../../context/AppContext';

interface JoinStepCredentialsProps {
  name: string;
  setName: (n: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (cp: string) => void;
  onNext: (e: React.FormEvent) => void;
}

export const JoinStepCredentials: React.FC<JoinStepCredentialsProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onNext,
}) => {
  const { lang } = useApp();
  const isEn = lang === 'en';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onNext} className="space-y-4 animate-in fade-in duration-200">
      {/* Informative Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/25 flex items-center gap-3 text-amber-900 dark:text-amber-200">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold">
            {isEn ? '1. Account & Login Credentials' : '1. खाता व लॉगिन विवरण'}
          </h4>
          <p className="text-[11px] text-stone-600 dark:text-stone-300">
            {isEn
              ? 'Enter your name, email, and password to begin registration.'
              : 'पंजीकरण प्रारंभ करने हेतु अपना नाम, ईमेल व पासवर्ड दर्ज करें।'}
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          {isEn ? 'Full Name' : 'पूरा नाम'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEn ? 'e.g. Ramesh Kumar' : 'उदा. रमेश कुमार'}
            className="pl-9 h-10 text-xs rounded-xl"
            autoFocus
          />
        </div>
      </div>

      {/* Email Input Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          {isEn ? 'Email Address' : 'ईमेल पता'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="pl-9 h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          {isEn ? 'Create Password' : 'पासवर्ड बनाएं'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEn ? 'Create secure password' : 'सुरक्षित पासवर्ड बनाएं'}
            className="pl-9 pr-10 h-10 text-xs rounded-xl"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password.length > 0 && password.length < 8 && (
          <p className="text-[10px] text-stone-500 dark:text-stone-400 pl-1 transition-all">
            {isEn ? 'Minimum 8 characters' : 'कम से कम 8 अक्षर'}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
          {isEn ? 'Confirm Password' : 'पासवर्ड पुष्टि'} <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={isEn ? 'Re-enter password' : 'पासवर्ड पुनः दर्ज करें'}
            className="pl-9 h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          {isEn ? 'Next: Fill Basic Details →' : 'आगे बढ़ें: मूल विवरण भरें →'}
        </button>
      </div>
    </form>
  );
};
