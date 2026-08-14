'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { Complaint } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface HomeGrievanceBannerProps {
  complaints: Complaint[];
  resolvedComplaintsCount: number;
}

export const HomeGrievanceBanner: React.FC<HomeGrievanceBannerProps> = ({
  complaints,
  resolvedComplaintsCount,
}) => {
  const { t } = useApp();
  const newComplaintsCount = complaints.filter((c) => c.status === 'NEW').length;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <Link
        href="/problems"
        className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#111726] border border-amber-400/40 dark:border-amber-700/40 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-amber-500/60 dark:hover:border-amber-600/60 transition-all duration-300 group cursor-pointer"
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 min-w-0 z-10">
          <div className="relative w-11 h-11 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 border border-amber-400/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            {newComplaintsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#111726] animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                {t('nav.problems')} ({t('home.grievanceTitle')})
              </h3>
            </div>
            <p className="text-xs text-[#6B6554] dark:text-slate-300 font-medium mt-0.5">
              {t('home.grievanceSubtitle')}
            </p>
          </div>
        </div>

        {/* Status badges & action button */}
        <div className="flex items-center gap-2.5 z-10 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            {newComplaintsCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {newComplaintsCount} {t('common.new')}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {resolvedComplaintsCount} {t('common.resolved')}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </section>
  );
};

