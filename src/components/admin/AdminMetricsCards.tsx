'use client';

import React from 'react';
import { useApp } from '@/src/context/AppContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AdminMetricsCards: React.FC = () => {
  const { stats, complaints } = useApp();

  const totalComplaintsCount = complaints.length || 1;
  const resolutionPercentage = Math.round(
    ((stats.resolvedProblems) / totalComplaintsCount) * 100
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric Card 1: Total Members */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-[#383a42] transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            Total Members
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <TrendingUp className="w-3 h-3" /> +12.5%
          </span>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.actualMembers.toLocaleString()}
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            Trending up this month <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Verified members across all village units
        </p>
      </div>

      {/* Metric Card 2: New Grievances */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-[#383a42] transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            New Grievances
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <TrendingDown className="w-3 h-3" /> -20%
          </span>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.newProblems}
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            Down 20% this period <TrendingDown className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Grievances awaiting immediate admin triage
        </p>
      </div>

      {/* Metric Card 3: Resolution Rate */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-[#383a42] transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            Resolved Rate
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <TrendingUp className="w-3 h-3" /> +12.5%
          </span>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {resolutionPercentage}%
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            Strong user retention <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          {stats.resolvedProblems} grievances successfully resolved
        </p>
      </div>

      {/* Metric Card 4: Social Initiatives */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-[#383a42] transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            Social Initiatives
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <TrendingUp className="w-3 h-3" /> +4.5%
          </span>
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.publishedSocialWork}
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            Steady performance <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Meets community growth projections
        </p>
      </div>
    </div>
  );
};
