'use client';

import React from 'react';
import { X } from 'lucide-react';
import { GymLogo } from '../../common/GymLogo';
import { useApp } from '../../../context/AppContext';
import { cn } from '@/src/lib/utils';

interface JoinModalHeaderProps {
  currentStep: 1 | 2 | 3 | 4;
  onClose: () => void;
}

export const JoinModalHeader: React.FC<JoinModalHeaderProps> = ({
  currentStep,
  onClose,
}) => {
  const { t, lang } = useApp();

  const getStepBadge = () => {
    switch (currentStep) {
      case 1:
        return lang === 'en' ? 'Step 1: Mobile OTP' : 'चरण १: मोबाइल ओटीपी';
      case 2:
        return lang === 'en' ? 'Step 2: Personal Info' : 'चरण २: व्यक्तिगत विवरण';
      case 3:
        return lang === 'en' ? 'Step 3: Background' : 'चरण ३: पृष्ठभूमि व संकल्प';
      case 4:
        return lang === 'en' ? 'Verified' : 'सफल';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return lang === 'en'
          ? 'Verify your mobile number with OTP to create member account'
          : 'सदस्य खाता बनाने हेतु मोबाइल नंबर सत्यापित करें';
      case 2:
        return lang === 'en'
          ? 'Enter personal details for your Digital ID Card'
          : 'डिजिटल सदस्य कार्ड हेतु अपना व्यक्तिगत विवरण भरें';
      case 3:
        return lang === 'en'
          ? 'Optional profession, designation & pledge'
          : 'व्यवसाय, पद, पृष्ठभूमि एवं सदस्यता संकल्प';
      case 4:
        return lang === 'en'
          ? 'Membership registered successfully'
          : 'सदस्यता सफलतापूर्वक दर्ज हो गई है';
    }
  };

  return (
    <>
      {/* Top Gradient Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      {/* Header Container */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <GymLogo size={32} variant="icon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {t('join.title')}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                {getStepBadge()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {getStepSubtitle()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {currentStep !== 4 && (
        <div className="grid grid-cols-3 gap-1 px-6 pt-3">
          <div
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              currentStep >= 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
            )}
          />
          <div
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
            )}
          />
          <div
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
            )}
          />
        </div>
      )}
    </>
  );
};
