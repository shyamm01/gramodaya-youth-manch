'use client';

import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ImageUploader } from '@/src/components/inputs/ImageUploader';
import type { Elder } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetEldersQuery,
  useAddElderMutation,
  useUpdateElderMutation,
  useDeleteElderMutation,
} from '@/src/store/api/adminApi';
import { selectFilteredElders, selectEditingElder } from '@/src/store/selectors/adminSelectors';
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

const ElderEditor: React.FC<{ elder: Elder; onClose: () => void }> = ({ elder, onClose }) => {
  const [updateElder, { isLoading }] = useUpdateElderMutation();
  const [name, setName] = useState(elder.name);
  const [mobile, setMobile] = useState(elder.mobile || '');
  const [location, setLocation] = useState(elder.location || '');
  const [details, setDetails] = useState(elder.details || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating elder record...');
    try {
      await updateElder({ id: elder.id, updates: { name, mobile, location, details } }).unwrap();
      setMessage('✅ Elder record updated!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <CompactEditor title="Edit Elder Record" message={message} busy={isLoading} onClose={onClose} onSubmit={handleSubmit}>
      <EditorField label="Full Name">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={editorFieldClass} />
      </EditorField>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Mobile">
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className={`${editorFieldClass} font-mono`}
          />
        </EditorField>
        <EditorField label="Location">
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={editorFieldClass} />
        </EditorField>
      </div>
      <EditorField label="Contributions / Field of Service">
        <textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className={editorFieldClass} />
      </EditorField>
    </CompactEditor>
  );
};

export const AdminEldersSection: React.FC = () => {
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
  } = useAdminSection('elders');

  const { isLoading, isFetching, refetch } = useGetEldersQuery();
  const [addElder] = useAddElderMutation();
  const [deleteElder] = useDeleteElderMutation();

  const elders = useAppSelector(selectFilteredElders);
  const editingElder = useAppSelector(selectEditingElder);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !location) {
      flash({ type: 'error', text: 'Name, mobile and location are all required.' });
      return;
    }
    setFormMessage('Adding senior citizen record...');
    try {
      await addElder({
        name,
        mobile,
        location,
        details,
        photoUrl: photoUrl || undefined,
      }).unwrap();
      setFormMessage('');
      closeForm();
      flash({ type: 'ok', text: 'Elder record saved.' });
      setName('');
      setMobile('');
      setPhotoUrl('');
      setLocation('');
      setDetails('');
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={Award}
        title="Senior Citizens & Elder Honors"
        description="Directory honoring respected senior villagers and their lifelong community contributions."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Elder
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <FilterBar>
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter('search', v)}
          placeholder="Search elders by name, mobile or location..."
        />
      </FilterBar>

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Honour an elder"
        description="Appears in the public elders directory."
      >
        <div className="space-y-4">
          {formMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
              {formMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={adminInputClass}
              />
              <input
                type="tel"
                required
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono"
              />
              <input
                type="text"
                required
                placeholder="Location / Hamlet"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <input
              type="text"
              placeholder="Contributions / Field of Service"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={adminInputClass}
            />
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="elders"
              label="Photograph"
              aspectRatio="square"
              hint="Optional — the crop step keeps the face centred"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Record
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      {isLoading ? (
        <SectionSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {elders.length === 0 && (
            <EmptyState message="No elders match this search." className="md:col-span-2" />
          )}
          {elders.map((el) => (
            <div key={el.id} className={`${adminCardClass} p-5 space-y-3`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{el.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => beginEdit(el.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Elder Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => askConfirm(el.id, el.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                {el.details || 'Senior Citizen'}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                <span>📞 {el.mobile || 'N/A'}</span>
                <span>📍 {el.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingElder && <ElderEditor key={editingElder.id} elder={editingElder} onClose={endEdit} />}

      <ConfirmDialog
        target={
          confirming
            ? { title: 'Remove honoured elder?', label: confirming.label, run: () => {} }
            : null
        }
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(() => deleteElder(confirming.id).unwrap(), `${confirming.label} was removed.`)
        }
      />
    </SectionShell>
  );
};
