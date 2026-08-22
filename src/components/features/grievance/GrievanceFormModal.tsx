'use client';

import React, { useState, useEffect } from 'react';
import { ComplaintCategory, ComplaintPriority } from '../../../types';
import { Button, Input, Textarea, Modal } from '../../ui';
import { ImageUploader } from '../../inputs';
import { CATEGORY_MAP } from './GrievanceCategoryFilter';
import { GrievancePriorityBadge } from './GrievancePriorityBadge';
import { Building2, MapPin, User, AlertCircle, FileText, Sparkles, ShieldCheck } from 'lucide-react';

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
  currentUserId?: string;
  currentUserName?: string;
  currentUserMobile?: string;
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
  currentUserId = '',
  currentUserName = '',
  currentUserMobile = '',
}) => {
  const [title, setTitle] = useState('');
  const [titleHindi, setTitleHindi] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electricity');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [villageId, setVillageId] = useState(defaultVillageId);
  const [description, setDescription] = useState('');
  const [descriptionHindi, setDescriptionHindi] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [ward, setWard] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [showHindiFields, setShowHindiFields] = useState(false);

  useEffect(() => {
    if (defaultVillageId) {
      setVillageId(defaultVillageId);
    }
  }, [defaultVillageId]);

  useEffect(() => {
    if (defaultLocation && !location) {
      setLocation(defaultLocation);
    }
  }, [defaultLocation, location]);

  const resetForm = () => {
    setTitle('');
    setTitleHindi('');
    setDescription('');
    setDescriptionHindi('');
    setPhotoUrl('');
    setVideoUrl('');
    setMsg('');
    setPriority('medium');
    setWard('');
    setShowHindiFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMsg(lang === 'en' ? 'Please provide both title and description.' : 'कृपया समस्या का शीर्षक और विवरण दोनों भरें।');
      return;
    }

    setSubmitting(true);
    setMsg('');

    const res = await onSubmit({
      userId: currentUserId || undefined,
      title: title.trim(),
      titleHindi: titleHindi.trim() || (lang === 'hi' ? title.trim() : undefined),
      category,
      priority,
      villageId: villageId || undefined,
      description: description.trim(),
      descriptionHindi: descriptionHindi.trim() || (lang === 'hi' ? description.trim() : undefined),
      location: location.trim() || (lang === 'en' ? 'Village Area' : 'ग्राम क्षेत्र'),
      ward: ward.trim() || undefined,
      reporterName: currentUserName || (lang === 'en' ? 'Registered Member' : 'पंजीकृत सदस्य'),
      reporterMobile: currentUserMobile || 'Hidden',
      photoUrl: photoUrl || undefined,
      videoUrl: videoUrl || undefined,
    });

    setSubmitting(false);

    if (res.success) {
      setMsg(t('problems.successMsg') || (lang === 'en' ? '✅ Grievance registered successfully!' : '✅ समस्या सफलतापूर्वक दर्ज कर ली गई है!'));
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } else {
      setMsg(res.error || (lang === 'en' ? 'An error occurred. Please try again.' : 'त्रुटि हुई। कृपया पुनः प्रयास करें।'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={lang === 'en' ? 'Register New Grievance' : 'नई ग्राम समस्या दर्ज करें'}
      description={lang === 'en' ? 'Submit an issue to Gramodaya Youth Manch for chapter tracking and resolution.' : 'ग्रामोदय यूथ मंच को गांव की समस्या से अवगत कराएं ताकि त्वरित समाधान कराया जा सके।'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Identity Banner (Linked to User ID) */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                <span className="truncate">{currentUserName || (lang === 'en' ? 'Current Member' : 'वर्तमान सदस्य')}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900 px-1.5 py-0.2 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  {lang === 'en' ? 'Verified' : 'सत्यापित'}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono truncate">
                {currentUserMobile ? `📱 ${currentUserMobile}` : ''} {currentUserId ? `• ID: #${currentUserId.slice(0, 8)}` : ''}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-lg flex-shrink-0">
            {lang === 'en' ? 'Auto-linked' : 'आईडी लिंक'}
          </span>
        </div>

        {/* 1. Category Picker */}
        <div>
          <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-2">
            {t('problems.categoryLabel')} <span className="text-red-500">*</span>
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
                    flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-[#1E3A2F] to-[#2D5545] dark:from-emerald-900 dark:to-emerald-800 text-white border-transparent shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-slate-800 text-[#2C3327] dark:text-slate-300 border-[#E0DCCF] dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }
                  `}
                >
                  <span className="text-base sm:text-lg">{catObj.icon}</span>
                  <span className="text-[10px] leading-tight text-center truncate w-full">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Priority & Village Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
              {lang === 'en' ? 'Urgency / Priority' : 'प्राथमिकता स्तर'}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`
                    px-2.5 py-1 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer
                    ${
                      priority === opt.value
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

          {/* Village Selector */}
          {villages && villages.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1.5">
                {lang === 'en' ? 'Village Chapter' : 'ग्राम इकाई'} <span className="text-red-500">*</span>
              </label>
              <select
                value={villageId}
                onChange={(e) => setVillageId(e.target.value)}
                className="w-full text-xs font-bold py-2 px-3 border border-[#E0DCCF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white cursor-pointer focus:ring-2 focus:ring-emerald-500"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {lang === 'en' ? v.name : v.nameHindi} {v.district ? `(${v.district})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 3. Location & Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {t('problems.locationInputLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-3" />
              <Input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. Near Primary School / Main Square' : 'उदा. प्राथमिक विद्यालय के पास / मुख्य चौराहा'}
                className="rounded-xl pl-8 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Ward / Tola (Optional)' : 'वार्ड / टोला (वैकल्पिक)'}
            </label>
            <Input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Ward 4 / Eastern Tola' : 'उदा. वार्ड 4 / पूर्वी टोला'}
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        {/* 4. Title & Description */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200">
                {t('problems.titleLabel')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowHindiFields(!showHindiFields)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {showHindiFields ? (lang === 'en' ? '− Hide Bilingual' : '− केवल एक भाषा') : (lang === 'en' ? '+ Add Hindi Version' : '+ द्विभाषी सामग्री जोड़ें')}
              </button>
            </div>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === 'en' ? 'Brief summary of the issue (e.g. Street light broken on Main Road)' : 'समस्या का संक्षिप्त विवरण (उदा. मुख्य मार्ग पर स्ट्रीट लाइट बंद)'}
              className="rounded-xl text-xs"
            />
          </div>

          {showHindiFields && (
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-2 animate-in fade-in duration-200">
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300">
                {lang === 'en' ? 'Hindi Title (वैकल्पिक)' : 'अंग्रेजी / अन्य शीर्षक (वैकल्पिक)'}
              </label>
              <Input
                type="text"
                value={titleHindi}
                onChange={(e) => setTitleHindi(e.target.value)}
                placeholder={lang === 'en' ? 'उदा. मुख्य मार्ग पर स्ट्रीट लाइट खराब' : 'e.g. Streetlight faulty on Main Road'}
                className="rounded-xl text-xs bg-white dark:bg-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {t('problems.descLabel')} <span className="text-red-500">*</span>
            </label>
            <Textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === 'en' ? 'Describe the issue in detail (since when it is happening, how many families are affected, etc.)...' : 'समस्या का पूरा विवरण लिखें (समस्या कब से है, कितने परिवार प्रभावित हैं, आदि)...'}
              className="rounded-xl text-xs leading-relaxed"
            />
          </div>

          {showHindiFields && (
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-2 animate-in fade-in duration-200">
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300">
                {lang === 'en' ? 'Hindi Description (वैकल्पिक)' : 'अंग्रेजी विवरण (वैकल्पिक)'}
              </label>
              <Textarea
                rows={2}
                value={descriptionHindi}
                onChange={(e) => setDescriptionHindi(e.target.value)}
                placeholder={lang === 'en' ? 'हिंदी में विस्तृत विवरण...' : 'Detailed description in English...'}
                className="rounded-xl text-xs bg-white dark:bg-slate-900 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* 5. Photo & Media Attachments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="grievances"
              label={t('problems.uploadPhotoLabel')}
              hint={lang === 'en' ? 'Upload evidence photo (JPG/PNG)' : 'समस्या की फोटो अपलोड करें'}
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {lang === 'en' ? 'Video Evidence Link (Optional)' : 'वीडियो लिंक (वैकल्पिक)'}
              </label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/... or Drive link"
                className="rounded-xl text-xs"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'en' ? 'Attach YouTube or cloud video link of the affected spot' : 'प्रभावित स्थल का वीडियो लिंक यहां जोड़ें'}
              </p>
            </div>
          </div>
        </div>

        {/* Status / Error / Success message */}
        {msg && (
          <div
            className={`p-3 text-xs font-bold rounded-xl whitespace-pre-line ${
              msg.includes('✅') || msg.includes(t('problems.successMsg'))
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}
          >
            {msg}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-xl px-4 text-xs font-bold"
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            variant="amber"
            size="sm"
            disabled={submitting || !title.trim() || !description.trim()}
            className="rounded-xl px-5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('common.loading')}
              </span>
            ) : (
              <span>{lang === 'en' ? 'Submit Grievance' : 'शिकायत दर्ज करें'}</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
