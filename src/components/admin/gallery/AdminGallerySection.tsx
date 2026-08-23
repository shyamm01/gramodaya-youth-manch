'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ImageUploader } from '@/src/components/inputs/ImageUploader';
import type { GalleryItem } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetGalleryQuery,
  useAddGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} from '@/src/store/api/adminApi';
import {
  selectFilteredGallery,
  selectEditingGalleryItem,
} from '@/src/store/selectors/adminSelectors';
import { useAdminSection } from '../hooks/useAdminSection';
import {
  CompactEditor,
  ConfirmDialog,
  EditorDialog,
  EditorField,
  EmptyState,
  FilterBar,
  NoticeBanner,
  SearchInput,
  SectionHeader,
  SectionShell,
  SectionSkeleton,
  adminCardClass,
  adminInputClass,
  editorFieldClass,
} from '../section-ui';

const CaptionEditor: React.FC<{ item: GalleryItem; onClose: () => void }> = ({ item, onClose }) => {
  const [updateGalleryItem, { isLoading }] = useUpdateGalleryItemMutation();
  const [caption, setCaption] = useState(item.caption || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating caption...');
    try {
      await updateGalleryItem({ id: item.id, updates: { caption } }).unwrap();
      setMessage('✅ Caption updated!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <CompactEditor title="Edit Caption" message={message} busy={isLoading} onClose={onClose} onSubmit={handleSubmit}>
      <EditorField label="Caption">
        <input
          type="text"
          required
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={editorFieldClass}
        />
      </EditorField>
    </CompactEditor>
  );
};

export const AdminGallerySection: React.FC = () => {
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
  } = useAdminSection('gallery');

  const { isLoading, isFetching, refetch } = useGetGalleryQuery();
  const [addGalleryItem] = useAddGalleryItemMutation();
  const [updateGalleryItem] = useUpdateGalleryItemMutation();
  const [deleteGalleryItem] = useDeleteGalleryItemMutation();

  const gallery = useAppSelector(selectFilteredGallery);
  const editingItem = useAppSelector(selectEditingGalleryItem);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [caption, setCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !photoUrl) {
      flash({ type: 'error', text: 'A caption and an uploaded photo are both required.' });
      return;
    }
    setFormMessage('Uploading media...');
    try {
      await addGalleryItem({
        caption,
        photoUrl,
        status: 'published',
        uploadedBy: currentUser?.name || 'Administrator',
      }).unwrap();
      setFormMessage('');
      closeForm();
      flash({ type: 'ok', text: 'Media item added.' });
      setCaption('');
      setPhotoUrl('');
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={ImageIcon}
        title="Media & Visual Gallery"
        description="Manage visual documentation of village initiatives, meetings, and achievements."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Media
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <FilterBar>
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter('search', v)}
          placeholder="Search media by caption or uploader..."
        />
      </FilterBar>

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Add a media item"
        description="Appears in the public gallery."
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
              placeholder="Caption / Description"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={adminInputClass}
            />
            {/* Was a box to paste a URL into, which meant the image had to be
                hosted somewhere else first. The uploader crops, compresses and
                stores it, and hands back the CDN URL the form submits. */}
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="gallery"
              label="Photo"
              aspectRatio="video"
              hint="Drag an image here or click to choose — crop before it uploads"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add to Gallery
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      {isLoading ? (
        <SectionSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.length === 0 && (
            <EmptyState
              message="No media items match this search."
              className="col-span-2 sm:col-span-3 md:col-span-4"
            />
          )}
          {gallery.map((item) => (
            <div key={item.id} className={`${adminCardClass} overflow-hidden group`}>
              <div className="h-32 bg-slate-100 dark:bg-[#18181c] relative overflow-hidden">
                <img
                  src={item.photoUrl}
                  alt={item.caption || 'Gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {item.status === 'pending' && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-amber-500/90 text-white text-[10px] font-bold">
                    Pending
                  </span>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  {item.status === 'pending' && (
                    <button
                      onClick={() =>
                        updateGalleryItem({ id: item.id, updates: { status: 'published' } })
                      }
                      className="p-1.5 bg-black/70 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer"
                      title="Approve and publish"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => beginEdit(item.id)}
                    className="p-1.5 bg-black/70 hover:bg-slate-900 text-white rounded-lg transition cursor-pointer"
                    title="Edit Caption"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => askConfirm(item.id, item.caption || 'this image')}
                    className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.caption || 'Untitled Media'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                  By {item.uploadedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingItem && <CaptionEditor key={editingItem.id} item={editingItem} onClose={endEdit} />}

      <ConfirmDialog
        target={
          confirming ? { title: 'Delete media item?', label: confirming.label, run: () => {} } : null
        }
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(
            () => deleteGalleryItem(confirming.id).unwrap(),
            `${confirming.label} was deleted.`
          )
        }
      />
    </SectionShell>
  );
};
