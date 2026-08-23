'use client';

import React, { useState } from 'react';
import { Volume2, Plus, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import type { Announcement } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetAnnouncementsQuery,
  useAddAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/src/store/api/adminApi';
import { selectEditingAnnouncement } from '@/src/store/selectors/adminSelectors';
import { useAdminSection } from '../hooks/useAdminSection';
import {
  CompactEditor,
  ConfirmDialog,
  EditorDialog,
  EditorField,
  EmptyState,
  NoticeBanner,
  SectionHeader,
  SectionShell,
  SectionSkeleton,
  adminCardClass,
  adminInputClass,
  editorFieldClass,
} from '../section-ui';

const AnnouncementEditor: React.FC<{ announcement: Announcement; onClose: () => void }> = ({
  announcement,
  onClose,
}) => {
  const [updateAnnouncement, { isLoading }] = useUpdateAnnouncementMutation();
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating announcement...');
    try {
      await updateAnnouncement({ id: announcement.id, updates: { title, content } }).unwrap();
      setMessage('✅ Announcement updated!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <CompactEditor
      title="Edit Announcement"
      message={message}
      busy={isLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <EditorField label="Title / Headline">
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={editorFieldClass} />
      </EditorField>
      <EditorField label="Content / Message">
        <textarea rows={4} required value={content} onChange={(e) => setContent(e.target.value)} className={editorFieldClass} />
      </EditorField>
    </CompactEditor>
  );
};

export const AdminAnnouncementsSection: React.FC = () => {
  const {
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
  } = useAdminSection('announcements');

  const { data: announcements = [], isLoading, isFetching, refetch } = useGetAnnouncementsQuery();
  const [addAnnouncement] = useAddAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const editingAnnouncement = useAppSelector(selectEditingAnnouncement);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      flash({ type: 'error', text: 'A title and content are both required.' });
      return;
    }
    setFormMessage('Publishing announcement...');
    try {
      await addAnnouncement({
        title,
        content,
        publishedBy: currentUser?.name || 'Administrator',
      }).unwrap();
      setFormMessage('');
      setTitle('');
      setContent('');
      closeForm();
      flash({ type: 'ok', text: 'Announcement published.' });
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={Volume2}
        title="Public Notices & Announcements"
        description="Broadcast administrative updates, government schemes, and emergency notices."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Announcement
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Publish an announcement"
        description="Goes out on the public notices page."
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
              placeholder="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={adminInputClass}
            />
            <textarea
              required
              rows={3}
              placeholder="Announcement Content / Details"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={adminInputClass}
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Publish Announcement
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      {isLoading ? (
        <SectionSkeleton variant="table" />
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 && <EmptyState message="No announcements published yet." />}
          {announcements.map((info) => (
            <div
              key={info.id}
              className={`${adminCardClass} p-4 flex items-start justify-between gap-4`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    NOTICE
                  </Badge>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    {info.date || info.createdAt?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{info.title}</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">{info.content}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Published by {info.publishedBy}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => beginEdit(info.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  title="Edit Announcement"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => askConfirm(info.id, info.title)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingAnnouncement && (
        <AnnouncementEditor
          key={editingAnnouncement.id}
          announcement={editingAnnouncement}
          onClose={endEdit}
        />
      )}

      <ConfirmDialog
        target={
          confirming
            ? { title: 'Delete announcement?', label: confirming.label, run: () => {} }
            : null
        }
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(
            () => deleteAnnouncement(confirming.id).unwrap(),
            `${confirming.label} was deleted.`
          )
        }
      />
    </SectionShell>
  );
};
