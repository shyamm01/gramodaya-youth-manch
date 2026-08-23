'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { ImageUploader } from '@/src/components/inputs/ImageUploader';
import type { ComplaintCategory, ComplaintStatus } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetComplaintsQuery,
  useAddComplaintMutation,
  useUpdateComplaintStatusMutation,
  useDeleteComplaintMutation,
} from '@/src/store/api/adminApi';
import {
  selectFilteredComplaints,
  selectEditingComplaint,
} from '@/src/store/selectors/adminSelectors';
import { useAdminSection } from '../hooks/useAdminSection';
import {
  ConfirmDialog,
  EditorDialog,
  EmptyState,
  FilterDate,
  FilterSelect,
  NoticeBanner,
  SearchInput,
  SectionHeader,
  SectionShell,
  SectionSkeleton,
  adminCardClass,
  adminInputClass,
} from '../section-ui';
import { ComplaintEditorModal } from './ComplaintEditorModal';

/** Mirrors the ComplaintCategory union in src/types.ts. */
const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Water',
  'Road',
  'Electricity',
  'Cleanliness',
  'Environment',
  'Education',
  'Health',
  'Sanitation',
  'Animal-related',
  'Social Issue',
  'Government Service',
  'Other',
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'NEW', label: 'New (Unassigned)' },
  { value: 'ACTION IN PROGRESS', label: 'Action In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export const AdminGrievancesSection: React.FC = () => {
  const {
    filters,
    updateFilter,
    beginEdit,
    endEdit,
    isFormOpen,
    openForm,
    closeForm,
    confirming,
    askConfirm,
    clearConfirm,
    confirmBusy,
    runConfirmed,
    notice,
    flash,
  } = useAdminSection('problems');

  const { isLoading, isFetching, refetch } = useGetComplaintsQuery();
  const [addComplaint] = useAddComplaintMutation();
  const [updateComplaintStatus] = useUpdateComplaintStatusMutation();
  const [deleteComplaint] = useDeleteComplaintMutation();

  const complaints = useAppSelector(selectFilteredComplaints);
  const editingComplaint = useAppSelector(selectEditingComplaint);
  const currentUser = useAppSelector((s) => s.auth.user);

  // Draft of the grievance being filed. Local by design — see MemberEditorModal.
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Water');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setReporterName('');
    setReporterMobile('');
    setPhotoUrl('');
    setFormMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !reporterName || !reporterMobile) {
      flash({ type: 'error', text: 'Every field except the photo is required.' });
      return;
    }
    setFormMessage('Filing grievance...');
    try {
      await addComplaint({
        title,
        category,
        description,
        location,
        reporterName,
        reporterMobile,
        photoUrl: photoUrl || undefined,
      }).unwrap();
      resetForm();
      closeForm();
      flash({ type: 'ok', text: 'Grievance filed.' });
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed to file grievance'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={AlertTriangle}
        title="Grievance Triage & Resolution"
        description="Manage status and record resolution steps for submitted civic complaints."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          File Grievance
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="File a grievance"
        description="Filed on behalf of a resident who walks in or phones."
      >
        <div className="space-y-4">
          {formMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
              {formMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Grievance title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={adminInputClass}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              required
              rows={3}
              placeholder="What is the problem?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={adminInputClass}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Location in the village"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={adminInputClass}
              />
              <input
                type="text"
                required
                placeholder="Reported by"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className={adminInputClass}
              />
              <input
                type="tel"
                required
                placeholder="Reporter mobile"
                value={reporterMobile}
                onChange={(e) => setReporterMobile(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="complaints"
              label="Photo of the problem"
              aspectRatio="video"
              hint="Optional — drag an image here or click to choose; crop before it uploads"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                File Grievance
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter('search', v)}
          placeholder="Search by title, description or reporter..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            aria-label="Filter by status"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            options={STATUS_OPTIONS}
          />
          <FilterDate
            value={filters.date}
            onChange={(v) => updateFilter('date', v)}
            placeholder="Reported Date"
          />
        </div>
      </div>

      {isLoading ? (
        <SectionSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.length === 0 && (
            <EmptyState message="No grievances match these filters." />
          )}
          {complaints.map((prob) => (
            <div key={prob.id} className={`${adminCardClass} p-5 space-y-4`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                    {prob.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {prob.title}
                  </h4>
                </div>
                <Badge
                  variant={
                    prob.status === 'RESOLVED'
                      ? 'emerald'
                      : prob.status === 'ACTION IN PROGRESS'
                        ? 'warning'
                        : 'destructive'
                  }
                  className="text-[10px]"
                >
                  {prob.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                {prob.description}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  Reporter: {prob.reporterName} ({prob.reporterMobile})
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={prob.status}
                    onChange={(e) =>
                      updateComplaintStatus({
                        id: prob.id,
                        status: e.target.value as ComplaintStatus,
                        adminName: currentUser?.name,
                        adminMobile: currentUser?.mobile,
                      })
                    }
                    className="px-2.5 py-1 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-lg text-[11px] font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACTION IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                  <button
                    onClick={() => beginEdit(prob.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Grievance"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => askConfirm(prob.id, prob.title)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ComplaintEditorModal complaint={editingComplaint} onClose={endEdit} />

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
    </SectionShell>
  );
};
