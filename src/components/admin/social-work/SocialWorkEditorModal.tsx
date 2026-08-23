'use client';

import React, { useState } from 'react';
import type { SocialWork } from '@/src/types';
import { useUpdateSocialWorkMutation } from '@/src/store/api/adminApi';
import { CompactEditor, EditorField, editorFieldClass } from '../section-ui';

const InnerEditor: React.FC<{ work: SocialWork; onClose: () => void }> = ({ work, onClose }) => {
  const [updateSocialWork, { isLoading }] = useUpdateSocialWorkMutation();

  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description);
  const [date, setDate] = useState(work.date || '');
  const [location, setLocation] = useState(work.location || '');
  const [status, setStatus] = useState<string>(work.status);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating initiative...');
    try {
      await updateSocialWork({
        id: work.id,
        updates: { title, description, date, location, status: status as any },
      }).unwrap();
      setMessage('✅ Initiative updated successfully!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <CompactEditor
      title="Edit Social Work Initiative"
      message={message}
      busy={isLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <EditorField label="Title">
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={editorFieldClass} />
      </EditorField>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={editorFieldClass} />
        </EditorField>
        <EditorField label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${editorFieldClass} font-bold`}
          >
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
          </select>
        </EditorField>
      </div>
      <EditorField label="Location">
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={editorFieldClass} />
      </EditorField>
      <EditorField label="Description">
        <textarea
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={editorFieldClass}
        />
      </EditorField>
    </CompactEditor>
  );
};

export const SocialWorkEditorModal: React.FC<{
  work: SocialWork | null;
  onClose: () => void;
}> = ({ work, onClose }) =>
  work ? <InnerEditor key={work.id} work={work} onClose={onClose} /> : null;
