'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Button, ImageUploader } from '../../ui';
import { Member } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface MemberPhotoModalProps {
  member: Member | null;
  onClose: () => void;
  onSave: (photoUrl: string) => Promise<void>;
}

export const MemberPhotoModal: React.FC<MemberPhotoModalProps> = ({
  member,
  onClose,
  onSave,
}) => {
  const { t } = useApp();
  const [previewPhoto, setPreviewPhoto] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setPreviewPhoto(member.photoUrl || '');
    }
  }, [member]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(previewPhoto);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog
      isOpen={Boolean(member)}
      onClose={onClose}
      title={t('members.photoModalTitle')}
      description={member?.name ? t('members.photoModalDesc', { name: member.name }) : undefined}
      maxWidth="sm"
    >
      <div className="space-y-4 py-2">
        {/* Drag & Drop Image Uploader with Supabase Storage */}
        <ImageUploader
          value={previewPhoto}
          onChange={setPreviewPhoto}
          onRemove={() => setPreviewPhoto('')}
          bucket="member-photos"
          folder="profiles"
          aspectRatio="square"
          hint="फोटो यहाँ खींचें या क्लिक करें (Drag & Drop or Click)"
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl font-bold shadow-sm"
          >
            {saving ? t('common.loading') : t('members.saveBtn')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
