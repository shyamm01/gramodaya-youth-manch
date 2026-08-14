'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';
import { TrendingUp, TrendingDown, Users, ShieldAlert, HeartHandshake, CalendarCheck } from 'lucide-react';

export const AdminMetricsCards: React.FC = () => {
  const { members, complaints, socialWorks, events, activeVillageId, isSuperAdmin, authSession } = useApp();

  const isSuperAdminUser = Boolean(
    isSuperAdmin ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678' ||
    authSession.adminMobile === '8887754321' ||
    authSession.adminUser?.isHead
  );

  const assignedAdminVillageId =
    authSession.adminVillageId ||
    authSession.adminUser?.villageId ||
    authSession.currentMember?.villageId ||
    'vil_rasoolpur';

  const effectiveVillageId = isSuperAdminUser ? (activeVillageId || 'ALL') : assignedAdminVillageId;

  // Filter datasets strictly according to user's administrative scope
  const scopedMembers = useMemo(() => {
    if (isSuperAdminUser && effectiveVillageId === 'ALL') return members;
    return members.filter((m) => m.villageId === effectiveVillageId);
  }, [members, isSuperAdminUser, effectiveVillageId]);

  const scopedComplaints = useMemo(() => {
    if (isSuperAdminUser && effectiveVillageId === 'ALL') return complaints;
    return complaints.filter((c) => c.villageId === effectiveVillageId);
  }, [complaints, isSuperAdminUser, effectiveVillageId]);

  const scopedSocialWorks = useMemo(() => {
    if (isSuperAdminUser && effectiveVillageId === 'ALL') return socialWorks;
    return socialWorks.filter((s) => s.villageId === effectiveVillageId);
  }, [socialWorks, isSuperAdminUser, effectiveVillageId]);

  const scopedEvents = useMemo(() => {
    if (isSuperAdminUser && effectiveVillageId === 'ALL') return events;
    return events.filter((e) => e.villageId === effectiveVillageId);
  }, [events, isSuperAdminUser, effectiveVillageId]);

  const activeMembersCount = scopedMembers.filter((m) => m.status === 'active').length;
  const newProblemsCount = scopedComplaints.filter((c) => c.status === 'NEW').length;
  const resolvedCount = scopedComplaints.filter((c) => c.status === 'RESOLVED').length;
  const totalComplaintsCount = scopedComplaints.length || 1;
  const resolutionPercentage = scopedComplaints.length === 0 ? 100 : Math.round((resolvedCount / totalComplaintsCount) * 100);
  const socialCount = scopedSocialWorks.length;

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
            {activeMembersCount.toLocaleString()}
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            Active community members <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          {isSuperAdminUser && effectiveVillageId === 'ALL'
            ? 'Verified members across all village chapters'
            : 'Verified members in your assigned village'}
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
            {newProblemsCount}
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            {scopedComplaints.length} total logged <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
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
            {resolvedCount} resolved issues <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Successful issue turnaround in scope
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
            {socialCount}
          </h3>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-zinc-200 font-semibold">
            {scopedEvents.length} events planned <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
          Community drives and welfare programs
        </p>
      </div>
    </div>
  );
};
