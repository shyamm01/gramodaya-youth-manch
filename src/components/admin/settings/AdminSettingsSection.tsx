'use client';

import React, { useState } from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '@/src/store/hooks';
import { useUpdateVillageMutation, useResetDataStoreMutation } from '@/src/store/api/adminApi';
import { adminCardClass, adminInputClass } from '../section-ui';

const LABEL = 'text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1';

export const AdminSettingsSection: React.FC = () => {
  const villageSettings = useAppSelector((s) => s.village?.settings);
  const activeVillageId = useAppSelector((s) => s.village?.activeVillageId);
  const [updateVillage] = useUpdateVillageMutation();
  const [resetDataStore] = useResetDataStoreMutation();

  const [orgName, setOrgName] = useState(villageSettings?.orgName || '');
  const [orgNameHindi, setOrgNameHindi] = useState(villageSettings?.orgNameHindi || '');
  const [tagline, setTagline] = useState(villageSettings?.tagline || '');
  const [taglineHindi, setTaglineHindi] = useState(villageSettings?.taglineHindi || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving settings...');
    try {
      await updateVillage({
        id: activeVillageId || 'vil_rasoolpur',
        updates: { orgName, orgNameHindi, tagline, taglineHindi },
      }).unwrap();
      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleTestUpload = async () => {
    try {
      const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#059669"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="sans-serif">Supabase OK</text></svg>`;
      const base64 = `data:image/svg+xml;base64,${btoa(testSvg)}`;
      const res = await fetch('/api/upload/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          bucket: 'member-photos',
          folder: 'system_test',
          filename: `test_${Date.now()}.svg`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Supabase Storage is working!\n\nPublic URL: ${data.url}`);
      } else {
        alert(`Supabase Storage response: ${data.error || 'Upload completed'}`);
      }
    } catch (err: any) {
      alert(`Supabase Storage test error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Organization Settings & Controls
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Manage organization profile, branding slogans, and platform database tools
        </p>
      </div>

      <div className={`${adminCardClass} p-6 space-y-5`}>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Organization Profile</h4>
        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Organization Name (English)</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={LABEL}>Organization Name (Hindi / Local)</label>
              <input
                type="text"
                value={orgNameHindi}
                onChange={(e) => setOrgNameHindi(e.target.value)}
                className={adminInputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Tagline / Slogan (English)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={LABEL}>Tagline / Slogan (Hindi / Local)</label>
              <input
                type="text"
                value={taglineHindi}
                onChange={(e) => setTaglineHindi(e.target.value)}
                className={adminInputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
          >
            Save Settings
          </button>
        </form>
      </div>

      <div className={`${adminCardClass} p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Supabase Storage Engine
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Direct cloud bucket storage for member profiles, chat media, and village galleries
              </p>
            </div>
          </div>

          <button
            onClick={handleTestUpload}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer self-start sm:self-auto"
          >
            Test Supabase Upload
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-[#18181c] rounded-xl border border-slate-200 dark:border-[#27272a] text-xs space-y-1.5 font-mono">
          <p className="text-slate-600 dark:text-slate-400 font-sans font-bold">
            Active Supabase Storage Buckets:
          </p>
          <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
            <p>
              • <code className="text-emerald-600 dark:text-emerald-400 font-bold">member-photos</code> — Citizen & leadership profile photos
            </p>
            <p>
              • <code className="text-emerald-600 dark:text-emerald-400 font-bold">images</code> — Village galleries, events, social works & chat media
            </p>
          </div>
        </div>
      </div>

      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>Factory Reset Database</span>
        </div>
        <p className="text-xs text-rose-600/80 dark:text-rose-300/70 leading-relaxed">
          This action will reset all local database records to default state. All transient testing
          data will be cleared.
        </p>
        <button
          onClick={async () => {
            if (confirm('Are you sure you want to factory reset all data to initial defaults?')) {
              await resetDataStore();
              alert('Database reset to defaults successfully!');
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
        >
          Reset Database (Factory Default)
        </button>
      </div>
    </div>
  );
};
