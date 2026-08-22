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
  const isHindi = lang === 'hi';
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
  const [showSecondaryFields, setShowSecondaryFields] = useState(false);

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
    setShowSecondaryFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const primaryTitle = isHindi ? titleHindi.trim() : title.trim();
    const primaryDesc = isHindi ? descriptionHindi.trim() : description.trim();

    if (!primaryTitle || !primaryDesc) {
      setMsg(
        isHindi
          ? 'कृपया समस्या का शीर्षक और विवरण (हिंदी में) दोनों भरें।'
          : 'Please provide both the title and description in English.'
      );
      return;
    }

    setSubmitting(true);
    setMsg('');

    // Fallback sync so database always has both or cleanly formatted values
    const finalTitle = title.trim() || titleHindi.trim();
    const finalTitleHindi = titleHindi.trim() || title.trim();
    const finalDesc = description.trim() || descriptionHindi.trim();
    const finalDescHindi = descriptionHindi.trim() || description.trim();

    const res = await onSubmit({
      userId: currentUserId || undefined,
      title: finalTitle,
      titleHindi: finalTitleHindi,
      category,
      priority,
      villageId: villageId || undefined,
      description: finalDesc,
      descriptionHindi: finalDescHindi,
      location: location.trim() || (isHindi ? 'ग्राम क्षेत्र' : 'Village Area'),
      locationHindi: isHindi ? location.trim() : undefined,
      ward: ward.trim() || undefined,
      wardHindi: isHindi ? ward.trim() : undefined,
      reporterName: currentUserName || (isHindi ? 'पंजीकृत सदस्य' : 'Registered Member'),
      reporterMobile: currentUserMobile || 'Hidden',
      photoUrl: photoUrl || undefined,
      videoUrl: videoUrl || undefined,
    });

    setSubmitting(false);

    if (res.success) {
      setMsg(t('problems.successMsg') || (isHindi ? '✅ समस्या सफलतापूर्वक दर्ज कर ली गई है!' : '✅ Grievance registered successfully!'));
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } else {
      setMsg(res.error || (isHindi ? 'त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'An error occurred. Please try again.'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={isHindi ? 'नई ग्राम समस्या दर्ज करें' : 'Register New Grievance'}
      description={isHindi ? 'ग्रामोदय यूथ मंच को गांव की समस्या से अवगत कराएं ताकि त्वरित समाधान कराया जा सके।' : 'Submit an issue to Gramodaya Youth Manch for chapter tracking and resolution.'}
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
                <span className="truncate">{currentUserName || (isHindi ? 'वर्तमान सदस्य' : 'Current Member')}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900 px-1.5 py-0.2 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  {isHindi ? 'सत्यापित' : 'Verified'}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono truncate">
                {currentUserMobile ? `📱 ${currentUserMobile}` : ''} {currentUserId ? `• ID: #${currentUserId.slice(0, 8)}` : ''}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-lg flex-shrink-0">
            {isHindi ? 'आईडी लिंक' : 'Auto-linked'}
          </span>
        </div>

        {/* 1. Category & Village Chapter Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              {isHindi ? 'समस्या की श्रेणी' : 'Category'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs font-bold px-3.5 pr-8 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111726] text-slate-800 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none shadow-2xs"
              >
                {CATEGORY_MAP.map((catObj) => {
                  const label = isHindi ? catObj.labelHindi : catObj.labelEnglish;
                  return (
                    <option key={catObj.id} value={catObj.id}>
                      {catObj.icon} {label}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Village Selector */}
          {villages && villages.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                {isHindi ? 'ग्राम इकाई' : 'Village Chapter'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  className="w-full text-xs font-bold pl-8.5 pr-8 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#111726] text-slate-800 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none shadow-2xs"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {isHindi ? v.nameHindi : v.name} {v.district ? `(${v.district})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Priority Segmented Control */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            {isHindi ? 'प्राथमिकता स्तर' : 'Urgency / Priority'}
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-[#111726] rounded-xl border border-slate-200/80 dark:border-slate-800">
            {PRIORITY_OPTIONS.map((opt) => {
              const isActive = priority === opt.value;
              const dotColors: Record<string, string> = {
                low: 'bg-sky-500',
                medium: 'bg-amber-500',
                high: 'bg-orange-500',
                urgent: 'bg-rose-500',
              };
              const activeTextColors: Record<string, string> = {
                low: 'text-sky-700 dark:text-sky-300',
                medium: 'text-amber-700 dark:text-amber-300',
                high: 'text-orange-700 dark:text-orange-300',
                urgent: 'text-rose-700 dark:text-rose-300',
              };

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`
                    flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer
                    ${
                      isActive
                        ? `bg-white dark:bg-[#1B2335] shadow-xs ${activeTextColors[opt.value]} ring-1 ring-black/5 dark:ring-white/10`
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColors[opt.value]} flex-shrink-0`} />
                  <span className="truncate">{isHindi ? opt.labelHindi : opt.labelEnglish}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Location & Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              {isHindi ? 'स्थान / पहचान' : 'Location / Landmark'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isHindi ? 'उदा. प्राथमिक विद्यालय के पास / मुख्य चौराहा' : 'e.g. Near Primary School / Main Square'}
                className="rounded-xl pl-8.5 text-xs bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              {isHindi ? 'वार्ड / टोला (वैकल्पिक)' : 'Ward / Tola (Optional)'}
            </label>
            <Input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder={isHindi ? 'उदा. वार्ड 4 / पूर्वी टोला' : 'e.g. Ward 4 / Eastern Tola'}
              className="rounded-xl text-xs bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* 4. Title & Description (Language-sensitive Primary & Secondary) */}
        <div className="space-y-3.5">
          {/* Primary Mandatory Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {isHindi ? 'समस्या का शीर्षक (हिंदी)' : 'Problem Title (English)'} <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSecondaryFields(!showSecondaryFields)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {showSecondaryFields
                  ? (isHindi ? '− अंग्रेजी शीर्षक/विवरण छुपाएं' : '− Hide Hindi Version')
                  : (isHindi ? '+ अंग्रेजी में भी जोड़ें (ऐच्छिक)' : '+ Add Hindi Version (Optional)')}
              </button>
            </div>
            <Input
              type="text"
              required
              value={isHindi ? titleHindi : title}
              onChange={(e) => (isHindi ? setTitleHindi(e.target.value) : setTitle(e.target.value))}
              placeholder={
                isHindi
                  ? 'संक्षिप्त शीर्षक (उदा. मुख्य मार्ग पर स्ट्रीट लाइट बंद)'
                  : 'Brief summary (e.g. Street light broken on Main Road)'
              }
              className="rounded-xl text-xs bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Secondary Optional Title (When Expanded) */}
          {showSecondaryFields && (
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-2 animate-in fade-in duration-200">
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300">
                {isHindi ? 'अंग्रेजी शीर्षक / English Title (वैकल्पिक)' : 'हिंदी शीर्षक / Hindi Title (वैकल्पिक)'}
              </label>
              <Input
                type="text"
                value={isHindi ? title : titleHindi}
                onChange={(e) => (isHindi ? setTitle(e.target.value) : setTitleHindi(e.target.value))}
                placeholder={
                  isHindi
                    ? 'e.g. Streetlight faulty on Main Road'
                    : 'उदा. मुख्य मार्ग पर स्ट्रीट लाइट खराब'
                }
                className="rounded-xl text-xs bg-white dark:bg-[#111726]"
              />
            </div>
          )}

          {/* Primary Mandatory Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              {isHindi ? 'विस्तृत विवरण (हिंदी)' : 'Detailed Description (English)'} <span className="text-rose-500">*</span>
            </label>
            <Textarea
              required
              rows={3}
              value={isHindi ? descriptionHindi : description}
              onChange={(e) => (isHindi ? setDescriptionHindi(e.target.value) : setDescription(e.target.value))}
              placeholder={
                isHindi
                  ? 'समस्या का पूरा विवरण लिखें (समस्या कब से है, कितने परिवार प्रभावित हैं, आदि)...'
                  : 'Describe the issue in detail (since when it is happening, how many families are affected, etc.)...'
              }
              className="rounded-xl text-xs leading-relaxed bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Secondary Optional Description (When Expanded) */}
          {showSecondaryFields && (
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-2 animate-in fade-in duration-200">
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300">
                {isHindi ? 'अंग्रेजी में विवरण / English Description (वैकल्पिक)' : 'हिंदी विवरण / Hindi Description (वैकल्पिक)'}
              </label>
              <Textarea
                rows={2}
                value={isHindi ? description : descriptionHindi}
                onChange={(e) => (isHindi ? setDescription(e.target.value) : setDescriptionHindi(e.target.value))}
                placeholder={
                  isHindi
                    ? 'Detailed description in English (optional)...'
                    : 'हिंदी में विस्तृत विवरण (वैकल्पिक)...'
                }
                className="rounded-xl text-xs bg-white dark:bg-[#111726] leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* 5. Photo & Media Attachments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div>
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="grievances"
              label={lang === 'en' ? 'Photo Evidence (Optional)' : 'फ़ोटो प्रमाण (ऐच्छिक)'}
              hint={lang === 'en' ? 'Upload evidence photo (JPG/PNG)' : 'समस्या की फोटो अपलोड करें'}
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                {lang === 'en' ? 'Video Evidence Link (Optional)' : 'वीडियो लिंक (वैकल्पिक)'}
              </label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/... or Drive link"
                className="rounded-xl text-xs bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800"
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
