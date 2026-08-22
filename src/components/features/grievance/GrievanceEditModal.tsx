'use client';

import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../../../types';
import { Button, Input, Textarea, Modal } from '../../ui';
import { ImageUploader } from '../../inputs';
import { CATEGORY_MAP } from './GrievanceCategoryFilter';
import { GrievancePriorityBadge } from './GrievancePriorityBadge';

const PRIORITY_OPTIONS: { value: ComplaintPriority; labelHindi: string; labelEnglish: string }[] = [
  { value: 'low', labelHindi: 'कम', labelEnglish: 'Low' },
  { value: 'medium', labelHindi: 'मध्यम', labelEnglish: 'Medium' },
  { value: 'high', labelHindi: 'उच्च', labelEnglish: 'High' },
  { value: 'urgent', labelHindi: 'अत्यावश्यक', labelEnglish: 'Urgent' },
];

interface GrievanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSave: (id: string, updates: Partial<Complaint>) => Promise<{ success: boolean; error?: string }>;
  lang: string;
  t: (key: string, opts?: any) => string;
  villages?: any[];
}

export const GrievanceEditModal: React.FC<GrievanceEditModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSave,
  lang,
  t,
  villages = [],
}) => {
  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Other');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [villageId, setVillageId] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHindi, setDescriptionHindi] = useState('');
  const [location, setLocation] = useState('');
  const [locationHindi, setLocationHindi] = useState('');
  const [ward, setWard] = useState('');
  const [wardHindi, setWardHindi] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (complaint) {
      setTitle(complaint.title || '');
      setTitleHindi(complaint.titleHindi || '');
      setCategory(complaint.category || 'Other');
      setPriority(complaint.priority || 'medium');
      setVillageId(complaint.villageId || '');
      setDescription(complaint.description || '');
      setDescriptionHindi(complaint.descriptionHindi || '');
      setLocation(complaint.location || '');
      setLocationHindi(complaint.locationHindi || '');
      setWard(complaint.ward || '');
      setWardHindi(complaint.wardHindi || '');
      setPhotoUrl(complaint.attachments?.[0]?.url || complaint.photoUrl || '');
      setMsg('');
    }
  }, [complaint]);

  if (!complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return;

    setSaving(true);
    setMsg('');

    const res = await onSave(complaint.id, {
      title: title.trim(),
      titleHindi: titleHindi.trim() || undefined,
      category,
      priority,
      villageId: villageId || undefined,
      description: description.trim(),
      descriptionHindi: descriptionHindi.trim() || undefined,
      location: location.trim(),
      locationHindi: locationHindi.trim() || undefined,
      ward: ward.trim() || undefined,
      wardHindi: wardHindi.trim() || undefined,
      photoUrl: photoUrl || undefined,
    });

    setSaving(false);

    if (res.success) {
      setMsg(lang === 'en' ? 'Grievance updated successfully.' : 'शिकायत सफलतापूर्वक अपडेट की गई।');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setMsg(res.error || (lang === 'en' ? 'Failed to update grievance.' : 'शिकायत अपडेट करने में त्रुटि हुई।'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'en' ? `Edit Grievance #${complaint.id}` : `शिकायत संपादन #${complaint.id}`}
      description={
        lang === 'en'
          ? 'Update the grievance details and attachments.'
          : 'शिकायत के विवरण और फ़ोटो को अपडेट करें।'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Title (English & Hindi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Title (English) *' : 'समस्या का शीर्षक (अंग्रेजी) *'}
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Waterlogging on main road"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Title (Hindi)' : 'समस्या का शीर्षक (हिंदी)'}
            </label>
            <Input
              type="text"
              value={titleHindi}
              onChange={(e) => setTitleHindi(e.target.value)}
              placeholder="उदा. मुख्य मार्ग पर जलभराव"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
            {t('problems.categoryLabel')}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#E0DCCF] dark:border-slate-800 rounded-xl bg-[#FDFBF7] dark:bg-[#0B0F17]">
            {CATEGORY_MAP.map((catObj) => {
              const label = lang === 'en' ? catObj.labelEnglish : catObj.labelHindi;
              const isActive = category === catObj.id;
              return (
                <button
                  key={catObj.id}
                  type="button"
                  onClick={() => setCategory(catObj.id)}
                  className={`
                    flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer truncate
                    ${isActive
                      ? 'bg-gradient-to-r from-[#1E3A2F] to-[#2D5545] dark:from-emerald-900 dark:to-emerald-800 text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-[#2C3327] dark:text-slate-300 border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300'
                    }
                  `}
                >
                  <span className="text-xs">{catObj.icon}</span>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
            {lang === 'en' ? 'Priority' : 'प्राथमिकता'}
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`
                  px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer
                  ${priority === opt.value
                    ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300'
                  }
                `}
              >
                <GrievancePriorityBadge priority={opt.value} lang={lang} size="xs" />
              </button>
            ))}
          </div>
        </div>

        {/* Description (English & Hindi) */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Description (English) *' : 'विवरण (अंग्रेजी) *'}
            </label>
            <Textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed problem description..."
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Description (Hindi)' : 'विवरण (हिंदी)'}
            </label>
            <Textarea
              rows={2}
              value={descriptionHindi}
              onChange={(e) => setDescriptionHindi(e.target.value)}
              placeholder="समस्या का विस्तृत हिंदी विवरण..."
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Village Selection */}
        {villages && villages.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Village Chapter' : 'ग्राम इकाई'}
            </label>
            <select
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 border border-[#E0DCCF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white cursor-pointer focus:ring-2 focus:ring-emerald-500"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {lang === 'en' ? v.name : v.nameHindi} {v.district ? `(${v.district})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location & Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {t('problems.locationInputLabel')}
            </label>
            <Input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Main Square' : 'उदा. मुख्य चौराहा'}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Ward / Tola' : 'वार्ड / टोला'}
            </label>
            <Input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Ward 5' : 'उदा. वार्ड 5'}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <ImageUploader
            value={photoUrl}
            onChange={setPhotoUrl}
            onRemove={() => setPhotoUrl('')}
            bucket="images"
            folder="grievances"
            label={t('problems.uploadPhotoLabel')}
            hint={lang === 'en' ? 'Change or add photo' : 'फ़ोटो बदलें या जोड़ें'}
          />
        </div>

        {/* Feedback message */}
        {msg && (
          <div
            className={`p-3 text-xs font-bold rounded-xl whitespace-pre-line ${
              msg.includes('सफलतापूर्वक') || msg.includes('successfully')
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}
          >
            {msg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl font-bold cursor-pointer"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="amber"
            size="sm"
            disabled={saving || !title.trim() || !description.trim()}
            className="rounded-xl font-bold cursor-pointer"
          >
            {saving ? (lang === 'en' ? 'Saving...' : 'सहेजा जा रहा है...') : (lang === 'en' ? 'Save Changes' : 'बदलाव सहेजें')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
