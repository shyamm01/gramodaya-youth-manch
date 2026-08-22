'use client';

import React, { useState } from 'react';
import { ComplaintCategory, ComplaintPriority } from '../../../types';
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

interface GrievanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  t: (key: string, opts?: any) => string;
  lang: string;
  defaultLocation?: string;
  defaultVillageId?: string;
  villages?: any[];
  /** Auto-fill from user session */
  defaultReporterName?: string;
  defaultReporterMobile?: string;
}

export const GrievanceFormModal: React.FC<GrievanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  t,
  lang,
  defaultLocation = '',
  defaultVillageId = '',
  villages = [],
  defaultReporterName = '',
  defaultReporterMobile = '',
}) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electricity');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [villageId, setVillageId] = useState(defaultVillageId);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [ward, setWard] = useState('');
  const [reporterName, setReporterName] = useState(defaultReporterName);
  const [reporterMobile, setReporterMobile] = useState(defaultReporterMobile);
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const totalSteps = 3;

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setVideoUrl('');
    setMsg('');
    setPriority('medium');
    setWard('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    setMsg('');

    const res = await onSubmit({
      title,
      category,
      priority,
      villageId: villageId || undefined,
      description,
      location,
      ward: ward || undefined,
      reporterName: reporterName || (lang === 'en' ? 'Village Resident' : 'ग्रामवासी'),
      reporterMobile: reporterMobile || 'Hidden',
      photoUrl,
      videoUrl,
    });

    setSubmitting(false);

    if (res.success) {
      setMsg(t('problems.successMsg'));
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1800);
    } else {
      setMsg(res.error || (lang === 'en' ? 'An error occurred. Please try again.' : 'त्रुटि हुई। कृपया पुनः प्रयास करें।'));
    }
  };

  const canGoNext = () => {
    if (step === 1) return reporterName.length >= 2;
    if (step === 2) return location.length >= 2;
    return true;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title={t('problems.modalTitle')}
      description={t('problems.modalDesc')}
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <button
              onClick={() => s < step && setStep(s)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${s === step
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-110'
                  : s < step
                    ? 'bg-emerald-500 text-white cursor-pointer hover:scale-105'
                    : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#8C8675] dark:text-slate-500 border border-[#E0DCCF] dark:border-slate-700'
                }
              `}
            >
              {s < step ? '✓' : s}
            </button>
            {s < totalSteps && (
              <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${s < step ? 'bg-emerald-400' : 'bg-[#E0DCCF] dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Reporter Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3">
              {lang === 'en' ? '👤 Step 1: Your Information' : '👤 चरण 1: आपकी जानकारी'}
            </p>
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.reporterNameLabel')}
              </label>
              <Input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. Ramesh Kumar' : 'उदा. रमेश कुमार'}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.reporterMobileLabel')}
              </label>
              <Input
                type="text"
                value={reporterMobile}
                onChange={(e) => setReporterMobile(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. 9876543210' : 'उदा. 9876543210'}
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Step 2: Category & Location */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3">
              {lang === 'en' ? '📋 Step 2: Category & Location' : '📋 चरण 2: श्रेणी और स्थान'}
            </p>

            {/* Visual Category Picker */}
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-2">
                {t('problems.categoryLabel')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORY_MAP.map((catObj) => {
                  const label = lang === 'en' ? catObj.labelEnglish : catObj.labelHindi;
                  const isActive = category === catObj.id;
                  return (
                    <button
                      key={catObj.id}
                      type="button"
                      onClick={() => setCategory(catObj.id)}
                      className={`
                        flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer
                        ${isActive
                          ? 'bg-gradient-to-br from-[#1E3A2F] to-[#2D5545] dark:from-emerald-900 dark:to-emerald-800 text-white border-transparent shadow-lg scale-[1.02]'
                          : 'bg-white dark:bg-slate-800 text-[#2C3327] dark:text-slate-300 border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                        }
                      `}
                    >
                      <span className="text-lg">{catObj.icon}</span>
                      <span className="text-[10px] leading-tight text-center">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-2">
                {lang === 'en' ? 'Priority' : 'प्राथमिकता'}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`
                      px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer
                      ${priority === opt.value
                        ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300'
                      }
                    `}
                  >
                    <GrievancePriorityBadge priority={opt.value} lang={lang} size="sm" />
                  </button>
                ))}
              </div>
            </div>

            {/* Village Selector */}
            {villages && villages.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                  {lang === 'en' ? 'Village Chapter *' : 'ग्राम इकाई चुनें *'}
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
                  {lang === 'en' ? 'Ward / Tola (Optional)' : 'वार्ड / टोला (वैकल्पिक)'}
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
          </div>
        )}

        {/* Step 3: Details & Attachments */}
        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3">
              {lang === 'en' ? '📝 Step 3: Description & Evidence' : '📝 चरण 3: विवरण और साक्ष्य'}
            </p>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.titleLabel')}
              </label>
              <Input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. Waterlogging on road' : 'उदा. सड़क पर जलभराव'}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.descLabel')}
              </label>
              <Textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'en' ? 'Write detailed description...' : 'समस्या का पूरा विवरण लिखें...'}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <ImageUploader
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  onRemove={() => setPhotoUrl('')}
                  bucket="images"
                  folder="grievances"
                  label={t('problems.uploadPhotoLabel')}
                  hint={lang === 'en' ? 'Take or choose a photo' : 'समस्या की फ़ोटो खींचें या चुनें'}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                  {lang === 'en' ? 'Video Link (Optional)' : 'वीडियो लिंक (वैकल्पिक)'}
                </label>
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {msg && (
          <div className={`p-3 text-xs font-bold rounded-xl whitespace-pre-line ${
            msg.includes('✅') || msg.includes(t('problems.successMsg'))
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}>
            {msg}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-2 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                className="rounded-xl"
              >
                ← {lang === 'en' ? 'Back' : 'वापस'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { resetForm(); onClose(); }}
              className="rounded-xl"
            >
              {t('common.cancel')}
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                variant="amber"
                size="sm"
                disabled={!canGoNext()}
                onClick={() => setStep(step + 1)}
                className="rounded-xl"
              >
                {lang === 'en' ? 'Next' : 'आगे'} →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="amber"
                size="sm"
                disabled={submitting || !title || !description}
                className="rounded-xl"
              >
                {submitting ? t('common.loading') : t('common.submit')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
