'use client';

import React, { useState, useEffect } from 'react';
import { Camera, UserCheck } from 'lucide-react';
import { Dialog, Avatar, AvatarImage, AvatarFallback, Button } from '../../ui';
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      <div className="text-center space-y-4 py-2">
        <Avatar size="xl" className="w-24 h-24 mx-auto ring-4 ring-emerald-500/30 shadow-md">
          {previewPhoto ? (
            <AvatarImage src={previewPhoto} alt="Preview" />
          ) : (
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <UserCheck className="w-12 h-12" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-3">
          <label className="block w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-2xs">
            <Camera className="w-3.5 h-3.5 inline mr-1.5" />
            <span>{t('members.chooseFileBtn')}</span>
            <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          </label>

          {previewPhoto && (
            <button
              onClick={() => setPreviewPhoto('')}
              className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline block mx-auto cursor-pointer"
            >
              {t('members.removePhotoBtn')}
            </button>
          )}

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
              className="rounded-xl"
            >
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
