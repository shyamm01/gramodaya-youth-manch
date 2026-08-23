'use client';

import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';

interface AdminUnauthorizedSectionProps {
  tabName: string;
  requiredCapability: string;
  description: string;
}

export const AdminUnauthorizedSection: React.FC<AdminUnauthorizedSectionProps> = ({
  tabName,
  requiredCapability,
  description,
}) => {
  const router = useRouter();
  const { authSession, lang } = useApp();

  const userRole = authSession.systemRole || authSession.role || (authSession.isAdminLoggedIn ? 'ADMIN' : 'MEMBER');
  const userName = authSession.currentMember?.name || authSession.adminMobile || 'Authenticated User';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="relative overflow-hidden bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-2xl border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10" />
          <span className="absolute -bottom-1 -right-1 p-1.5 bg-rose-600 rounded-full border-2 border-white dark:border-stone-900 text-white">
            <Lock className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Title and Module Information */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Unauthorized Module Access (403)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'en' ? 'Access Restricted' : 'अनधिकृत पहुंच (Access Restricted)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            {lang === 'en'
              ? `You do not have the required permissions to access the "${tabName}" module.`
              : `आपके पास "${tabName}" मॉड्यूल को एक्सेस करने की आवश्यक अनुमति नहीं है।`}
          </p>
        </div>

        {/* Security & Capability Breakdown */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3 font-medium text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Current User:</span>
            <span className="font-bold text-slate-900 dark:text-white">{userName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Current Assigned Role:</span>
            <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px]">
              {userRole}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Required Capability:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px]">
              {requiredCapability}
            </span>
          </div>
          <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            💡 {description}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <a
            href="mailto:support@gramodayarasoolpur.org?subject=Permission%20Access%20Request"
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Request Permission</span>
          </a>
        </div>
      </div>
    </div>
  );
};
