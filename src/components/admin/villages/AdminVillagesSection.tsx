'use client';

import React, { useState } from 'react';
import { Globe, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import type { Village } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetVillagesQuery,
  useAddVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
} from '@/src/store/api/adminApi';
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

const VillageEditor: React.FC<{ village: Village; onClose: () => void }> = ({ village, onClose }) => {
  const [updateVillage, { isLoading }] = useUpdateVillageMutation();
  const [name, setName] = useState(village.name);
  const [nameHindi, setNameHindi] = useState(village.nameHindi || '');
  const [contactMobile, setContactMobile] = useState(village.contactMobile || '');
  const [orgName, setOrgName] = useState(village.orgName || '');
  const [orgNameHindi, setOrgNameHindi] = useState(village.orgNameHindi || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating village unit...');
    try {
      await updateVillage({
        id: village.id,
        updates: { name, nameHindi, contactMobile, orgName, orgNameHindi },
      }).unwrap();
      setMessage('✅ Village unit updated!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <CompactEditor title="Edit Village Unit" message={message} busy={isLoading} onClose={onClose} onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Name (English)">
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={editorFieldClass} />
        </EditorField>
        <EditorField label="Name (Hindi)">
          <input type="text" value={nameHindi} onChange={(e) => setNameHindi(e.target.value)} className={editorFieldClass} />
        </EditorField>
      </div>
      <EditorField label="Contact Mobile">
        <input
          type="tel"
          value={contactMobile}
          onChange={(e) => setContactMobile(e.target.value)}
          className={`${editorFieldClass} font-mono`}
        />
      </EditorField>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Chapter Name">
          <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={editorFieldClass} />
        </EditorField>
        <EditorField label="Chapter Name (Hindi)">
          <input type="text" value={orgNameHindi} onChange={(e) => setOrgNameHindi(e.target.value)} className={editorFieldClass} />
        </EditorField>
      </div>
    </CompactEditor>
  );
};

export const AdminVillagesSection: React.FC = () => {
  const {
    beginEdit,
    endEdit,
    editingId,
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
  } = useAdminSection('villages');

  const { data: villages = [], isLoading, isFetching, refetch } = useGetVillagesQuery();
  const [addVillage] = useAddVillageMutation();
  const [deleteVillage] = useDeleteVillageMutation();

  const editingVillage = villages.find((v) => v.id === editingId) ?? null;

  const [name, setName] = useState('');
  const [nameHindi, setNameHindi] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgNameHindi] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nameHindi || !contactMobile) {
      flash({ type: 'error', text: 'Name, Hindi name and contact mobile are all required.' });
      return;
    }
    setFormMessage('Registering village branch...');
    try {
      await addVillage({
        name,
        nameHindi,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        orgName: orgName || `${name} Youth Manch`,
        orgNameHindi: orgNameHindi || `${nameHindi} युवा मंच`,
        contactMobile,
        isActive: true,
      }).unwrap();
      setFormMessage('');
      closeForm();
      flash({ type: 'ok', text: 'Village unit registered.' });
      setName('');
      setNameHindi('');
      setContactMobile('');
      setOrgName('');
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={Globe}
        title="Village Units & Multi-Tenant Management"
        description="Manage village chapters, local unit assignments, and local administrators."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Village
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Register a village unit"
        description="Creates a new chapter of the Manch."
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
                placeholder="Village Name (English, e.g. Jamua)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={adminInputClass}
              />
              <input
                type="text"
                required
                placeholder="Village Name (Hindi / Local, e.g. जमुआ)"
                value={nameHindi}
                onChange={(e) => setNameHindi(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="tel"
                required
                placeholder="Contact Mobile Number"
                value={contactMobile}
                onChange={(e) => setContactMobile(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono"
              />
              <input
                type="text"
                placeholder="Organization Chapter Name (e.g. Jamua Youth Manch)"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Register Village Unit
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      {isLoading ? (
        <SectionSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {villages.length === 0 && (
            <EmptyState message="No village units yet." className="md:col-span-3" />
          )}
          {villages.map((v) => (
            <div key={v.id} className={`${adminCardClass} p-5 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1c1d22] flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => beginEdit(v.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Village Unit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {villages.length > 1 && (
                    <button
                      onClick={() => askConfirm(v.id, v.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Org: {v.orgName || v.orgNameHindi}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] text-[11px] font-mono text-slate-400 dark:text-zinc-500 space-y-0.5">
                <p>Contact: {v.contactMobile || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingVillage && (
        <VillageEditor key={editingVillage.id} village={editingVillage} onClose={endEdit} />
      )}

      <ConfirmDialog
        target={confirming ? { title: 'Delete village?', label: confirming.label, run: () => {} } : null}
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(() => deleteVillage(confirming.id).unwrap(), `${confirming.label} was deleted.`)
        }
      />
    </SectionShell>
  );
};
