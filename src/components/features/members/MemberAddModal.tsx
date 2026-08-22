'use client';

import React, { useState } from 'react';
import { Camera, UserCheck, CheckCircle2 } from 'lucide-react';
import { Modal, Avatar, AvatarImage, AvatarFallback, Input, Button } from '../../ui';
import { ImageUploader } from '../../inputs';
import { useApp } from '../../../context/AppContext';

interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (
    name: string,
    mobile: string,
    photo: string,
    date: string,
    org: string
  ) => Promise<{ success: boolean; error?: string }>;
  isAdminLoggedIn: boolean;
}

export const MemberAddModal: React.FC<MemberAddModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  isAdminLoggedIn,
}) => {
  const { t } = useApp();
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState('');
  const [newMemberOrg, setNewMemberOrg] = useState('ग्रामोदय यूथ मंच');
  const [newMemberDate, setNewMemberDate] = useState<string>('2026-08-01');
  const [submitting, setSubmitting] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setSubmitting(true);
    setAddMsg('');
    const res = await onAddMember(
      newMemberName.trim(),
      newMemberMobile.trim(),
      newMemberPhoto,
      newMemberDate || '2026-08-01',
      newMemberOrg.trim() || 'ग्रामोदय यूथ मंच'
    );
    setSubmitting(false);

    if (res.success) {
      setAddMsg(
        isAdminLoggedIn
          ? t('members.memberAddedSuccessAdmin')
          : t('members.memberAddedSuccessPublic')
      );
      setNewMemberName('');
      setNewMemberMobile('');
      setNewMemberPhoto('');
      setNewMemberOrg('ग्रामोदय यूथ मंच');
      setNewMemberDate('2026-08-01');
      setTimeout(() => {
        onClose();
        setAddMsg('');
      }, 1500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('members.addModalTitle')}
      description={t('members.addModalDesc')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload with Supabase Storage and Drag & Drop */}
        <div>
          <ImageUploader
            value={newMemberPhoto}
            onChange={setNewMemberPhoto}
            onRemove={() => setNewMemberPhoto('')}
            bucket="member-photos"
            folder="profiles"
            label={t('members.uploadPhotoBtn')}
            aspectRatio="square"
            hint="फ़ोटो यहाँ खींचें या क्लिक करें (Drag & Drop or Click)"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
            {t('members.memberNameLabel')}
          </label>
          <Input
            type="text"
            required
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="उदा. रामेश्वर कुमार"
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
            {t('members.memberMobileLabel')}
          </label>
          <Input
            type="text"
            required
            value={newMemberMobile}
            onChange={(e) => setNewMemberMobile(e.target.value)}
            placeholder="उदा. 9876543210"
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
            {t('members.memberJoinDateLabel')}
          </label>
          <Input
            type="date"
            required
            value={newMemberDate}
            onChange={(e) => setNewMemberDate(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
            {t('members.memberOrgLabel')}
          </label>
          <Input
            type="text"
            required
            value={newMemberOrg}
            onChange={(e) => setNewMemberOrg(e.target.value)}
            placeholder="उदा. ग्रामोदय यूथ मंच"
            className="rounded-xl"
          />
        </div>

        {addMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{addMsg}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={submitting}
            className="rounded-xl"
          >
            {submitting ? t('common.loading') : t('common.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
