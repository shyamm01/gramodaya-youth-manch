'use client';

import React, { useState } from 'react';
import type { Complaint, ComplaintStatus } from '@/src/types';
import { useUpdateComplaintMutation } from '@/src/store/api/adminApi';

const FIELD =
  'w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white';
const LABEL = 'text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1';

const InnerEditor: React.FC<{ complaint: Complaint; onClose: () => void }> = ({
  complaint,
  onClose,
}) => {
  const [updateComplaint, { isLoading }] = useUpdateComplaintMutation();

  const [title, setTitle] = useState(complaint.title);
  const [category, setCategory] = useState<string>(complaint.category);
  const [description, setDescription] = useState(complaint.description);
  const [location, setLocation] = useState(complaint.location || '');
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating grievance...');
    try {
      await updateComplaint({
        id: complaint.id,
        updates: { title, category: category as any, description, location, status },
      }).unwrap();
      setMessage('✅ Grievance updated successfully!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Grievance</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
        {message && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={LABEL}>Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                className={`${FIELD} font-bold`}
              >
                <option value="NEW">NEW</option>
                <option value="ACTION IN PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={FIELD}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-60 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
            >
              {isLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ComplaintEditorModal: React.FC<{
  complaint: Complaint | null;
  onClose: () => void;
}> = ({ complaint, onClose }) =>
  complaint ? <InnerEditor key={complaint.id} complaint={complaint} onClose={onClose} /> : null;
