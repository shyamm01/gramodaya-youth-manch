'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useDeleteComplaintMutation,
} from '@/src/store/api/adminApi';
import { selectComplaints } from '@/src/store/selectors/adminSelectors';
import { useAdminSection } from '../hooks/useAdminSection';
import { AdminMetricsCards } from '../widgets/AdminMetricsCards';
import { AdminActivityChart } from '../widgets/AdminActivityChart';
import { AdminMemberTrendChart } from '../widgets/AdminMemberTrendChart';
import { ConfirmDialog, adminCardClass } from '../section-ui';

export const AdminDashboardSection: React.FC = () => {
  const router = useRouter();
  const { confirming, askConfirm, clearConfirm, confirmBusy, runConfirmed } =
    useAdminSection('problems');

  useGetComplaintsQuery();
  const complaints = useAppSelector(selectComplaints);
  const currentUser = useAppSelector((s) => s.auth.user);
  const [updateComplaintStatus] = useUpdateComplaintStatusMutation();
  const [deleteComplaint] = useDeleteComplaintMutation();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top 4 KPI Metrics Row */}
      <AdminMetricsCards />

      {/* Dedicated Member Registration & Add Trend Chart */}
      <AdminMemberTrendChart />

      {/* Interactive Activity & Community Growth Chart */}
      <AdminActivityChart />

      {/* Pending Triage Queue Table */}
      <div className={`${adminCardClass} p-6 space-y-4 transition-colors`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Grievances Pending Action
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Direct submissions awaiting verification and triage
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/problems')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            View all ({complaints.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#1e1f24] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                <th className="pb-3 px-2">Title / Issue</th>
                <th className="pb-3 px-2">Reporter</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f24] text-slate-700 dark:text-zinc-300">
              {complaints.slice(0, 5).map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-[#18181d] transition">
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {comp.title}
                  </td>
                  <td className="py-3 px-2">{comp.reporterName || 'Anonymous'}</td>
                  <td className="py-3 px-2 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                    {comp.category}
                  </td>
                  <td className="py-3 px-2">
                    <Badge
                      variant={
                        comp.status === 'RESOLVED'
                          ? 'emerald'
                          : comp.status === 'NEW'
                            ? 'warning'
                            : 'outline'
                      }
                      className="text-[10px]"
                    >
                      {comp.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right space-x-1.5">
                    <button
                      onClick={() =>
                        updateComplaintStatus({
                          id: comp.id,
                          status: 'RESOLVED',
                          adminName: currentUser?.name,
                          adminMobile: currentUser?.mobile,
                        })
                      }
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => askConfirm(comp.id, comp.title)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Helpdesk Inbox Callout Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Admin Helpdesk & Citizen Inquiries</h4>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Citizen messages sent from the live chat Helpdesk tab appear here in real-time.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/helpdesk')}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <span>Open Helpdesk Inbox</span>
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        target={
          confirming ? { title: 'Delete grievance?', label: confirming.label, run: () => {} } : null
        }
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(
            () =>
              deleteComplaint({
                id: confirming.id,
                adminName: currentUser?.name,
                adminMobile: currentUser?.mobile,
                userMobile: currentUser?.mobile,
              }).unwrap(),
            `${confirming.label} was deleted.`
          )
        }
      />
    </div>
  );
};
