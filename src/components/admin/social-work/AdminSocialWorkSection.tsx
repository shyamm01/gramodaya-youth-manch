'use client';

import React, { useState } from 'react';
import { HeartHandshake, Plus, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { DatePicker } from '@/src/components/inputs/DatePicker';
import { ImageUploader } from '@/src/components/inputs/ImageUploader';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetSocialWorksQuery,
  useAddSocialWorkMutation,
  useUpdateSocialWorkStatusMutation,
  useDeleteSocialWorkMutation,
} from '@/src/store/api/adminApi';
import {
  selectFilteredSocialWorks,
  selectEditingSocialWork,
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
import { SocialWorkEditorModal } from './SocialWorkEditorModal';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
];

export const AdminSocialWorkSection: React.FC = () => {
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
  } = useAdminSection('socialWork');

  const { isLoading, isFetching, refetch } = useGetSocialWorksQuery();
  const [addSocialWork] = useAddSocialWorkMutation();
  const [updateStatus] = useUpdateSocialWorkStatusMutation();
  const [deleteSocialWork] = useDeleteSocialWorkMutation();

  const socialWorks = useAppSelector(selectFilteredSocialWorks);
  const editingWork = useAppSelector(selectEditingSocialWork);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterMobile, setSubmitterMobile] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !location || !submitterName) {
      flash({ type: 'error', text: 'Title, description, date, location and submitter are all required.' });
      return;
    }
    setFormMessage('Recording initiative...');
    try {
      await addSocialWork({
        title,
        description,
        date,
        location,
        submitterName,
        submitterMobile,
        photoUrl: photoUrl || undefined,
      }).unwrap();
      setFormMessage('');
      closeForm();
      flash({ type: 'ok', text: 'Initiative recorded.' });
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setSubmitterName('');
      setSubmitterMobile('');
      setPhotoUrl('');
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed to record initiative'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={HeartHandshake}
        title="Social Initiatives & Development Works"
        description="Review, approve, and showcase verified community initiatives."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Initiative
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Record an initiative"
        description="Appears on the public social work page once approved."
      >
        <div className="space-y-4">
          {formMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
              {formMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Initiative title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={adminInputClass}
            />
            <textarea
              required
              rows={3}
              placeholder="What was done, and by whom?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={adminInputClass}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Date of the initiative"
                lang="en"
                className="py-2 text-xs"
              />
              <input
                type="text"
                required
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Submitted by"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className={adminInputClass}
              />
              <input
                type="tel"
                placeholder="Submitter mobile (optional)"
                value={submitterMobile}
                onChange={(e) => setSubmitterMobile(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="social-work"
              label="Photo of the initiative"
              aspectRatio="video"
              hint="Optional — drag an image here or click to choose; crop before it uploads"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Record Initiative
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter('search', v)}
          placeholder="Search initiatives by title or submitter..."
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
            placeholder="Initiative Date"
          />
        </div>
      </div>

      {isLoading ? (
        <SectionSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialWorks.length === 0 && (
            <EmptyState message="No initiatives match these filters." className="md:col-span-2" />
          )}
          {socialWorks.map((soc) => (
            <div key={soc.id} className={`${adminCardClass} p-5 space-y-4`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                    {soc.date}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {soc.title}
                  </h4>
                </div>
                <Badge
                  variant={soc.status === 'approved' || soc.status === 'published' ? 'emerald' : 'warning'}
                  className="text-[10px]"
                >
                  {soc.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                {soc.description}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  By: {soc.submitterName}
                </span>
                <div className="flex items-center gap-2">
                  {soc.status === 'pending' && (
                    <button
                      onClick={() =>
                        updateStatus({
                          id: soc.id,
                          status: 'approved',
                          adminName: currentUser?.name,
                          adminMobile: currentUser?.mobile,
                        })
                      }
                      className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => beginEdit(soc.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Initiative"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => askConfirm(soc.id, soc.title)}
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

      <SocialWorkEditorModal work={editingWork} onClose={endEdit} />

      <ConfirmDialog
        target={
          confirming ? { title: 'Delete initiative?', label: confirming.label, run: () => {} } : null
        }
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(
            () =>
              deleteSocialWork({
                id: confirming.id,
                adminName: currentUser?.name,
                adminMobile: currentUser?.mobile,
              }).unwrap(),
            `${confirming.label} was deleted.`
          )
        }
      />
    </SectionShell>
  );
};
