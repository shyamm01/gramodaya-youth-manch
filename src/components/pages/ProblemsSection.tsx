'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory, ComplaintStatus } from '../../types';
import { AlertTriangle, Plus, MapPin, Phone, Trash2 } from 'lucide-react';
import { StatusBadge } from '../common/EntityLabels';
import {
  Button,
  Card,
  Input,
  Textarea,
  Dialog,
  Badge,
} from '../ui';

const CATEGORY_MAP: { id: ComplaintCategory; labelHindi: string; labelEnglish: string; icon: string }[] = [
  { id: 'Water', labelHindi: 'पानी', labelEnglish: 'Water', icon: '🚰' },
  { id: 'Road', labelHindi: 'सड़क', labelEnglish: 'Road', icon: '🛣️' },
  { id: 'Electricity', labelHindi: 'बिजली', labelEnglish: 'Electricity', icon: '💡' },
  { id: 'Cleanliness', labelHindi: 'स्वच्छता', labelEnglish: 'Cleanliness', icon: '🧹' },
  { id: 'Environment', labelHindi: 'पर्यावरण', labelEnglish: 'Environment', icon: '🌳' },
  { id: 'Education', labelHindi: 'शिक्षा', labelEnglish: 'Education', icon: '🏫' },
  { id: 'Health', labelHindi: 'स्वास्थ्य', labelEnglish: 'Health', icon: '🏥' },
  { id: 'Sanitation', labelHindi: 'शौचालय', labelEnglish: 'Sanitation', icon: '🚽' },
  { id: 'Animal-related', labelHindi: 'पशु संबंधी मुद्दा', labelEnglish: 'Animal Issue', icon: '🐄' },
  { id: 'Social Issue', labelHindi: 'सामाजिक मुद्दा', labelEnglish: 'Social Issue', icon: '👥' },
  { id: 'Government Service', labelHindi: 'सरकारी सेवा', labelEnglish: 'Govt Service', icon: '🏛️' },
  { id: 'Other', labelHindi: 'अन्य', labelEnglish: 'Other', icon: '📌' },
];

export const ProblemsSection: React.FC = () => {
  const {
    complaints,
    submitComplaint,
    authSession,
    isApprovedMember,
    currentMemberMobile,
    setIsMemberLoginModalOpen,
    canEditContent,
    canDeleteContent,
    updateComplaintStatus,
    deleteComplaint,
    t,
    lang,
    villageSettings,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unapprovedAlert, setUnapprovedAlert] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electricity');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(lang === 'en' ? (villageSettings.name || 'Rasoolpur') : villageSettings.nameHindi);
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const filteredComplaints =
    filterCategory === 'ALL'
      ? complaints
      : complaints.filter((c) => c.category === filterCategory);

  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    setMsg('');

    const res = await submitComplaint({
      title,
      category,
      description,
      location,
      reporterName: reporterName || (lang === 'en' ? 'Village Resident' : 'ग्रामवासी'),
      reporterMobile: reporterMobile || 'Hidden',
      photoUrl,
      videoUrl,
    });

    setSubmitting(false);

    if (res.success) {
      setMsg(t('problems.successMsg'));
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      setVideoUrl('');
      setTimeout(() => {
        setIsModalOpen(false);
        setMsg('');
      }, 2000);
    } else {
      setMsg(res.error || (lang === 'en' ? 'An error occurred. Please try again.' : 'त्रुटि हुई। कृपया पुनः प्रयास करें।'));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>{t('nav.problems')}</span>
          </h1>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 font-medium">
            {t('problems.totalRegistered', { count: complaints.length })} |{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {t('problems.resolvedCount', { count: resolvedCount })}
            </span>
          </p>
        </div>

        <Button
          variant="amber"
          size="default"
          onClick={() => {
            if (!authSession.isAdminLoggedIn && !authSession.isMemberLoggedIn) {
              setIsMemberLoginModalOpen(true);
            } else if (!isApprovedMember) {
              setUnapprovedAlert(true);
            } else {
              setIsModalOpen(true);
            }
          }}
          className="rounded-xl font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>{t('problems.registerNewBtn')}</span>
        </Button>
      </div>

      {/* Pending Approval Notice Banner for Unapproved Member */}
      {authSession.isMemberLoggedIn && !isApprovedMember && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है।</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                आप गांव की सभी शिकायतें, आंकड़े और जानकारी देख सकते हैं। एडमिन द्वारा अनुमोदन के बाद आप नई शिकायतें दर्ज कर सकेंगे।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal alert popup if unapproved member tries to post */}
      {unapprovedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              सदस्यता अनुमोदन लंबित (Pending Approval)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              आपकी सदस्यता का सत्यापन अभी एडमिन द्वारा किया जा रहा है। आप सभी सार्वजनिक शिकायतें और डेटा देख सकते हैं। अनुमोदन के बाद आप नई शिकायतें दर्ज कर सकेंगे।
            </p>
            <Button
              variant="default"
              size="default"
              onClick={() => setUnapprovedAlert(false)}
              className="w-full rounded-xl font-bold"
            >
              समझ गया (Got It)
            </Button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Button
          size="xs"
          variant={filterCategory === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('ALL')}
          className="rounded-xl whitespace-nowrap cursor-pointer font-bold"
        >
          {t('common.all')} ({complaints.length})
        </Button>
        {CATEGORY_MAP.map((catObj) => {
          const count = complaints.filter((c) => c.category === catObj.id).length;
          const label = lang === 'en' ? catObj.labelEnglish : catObj.labelHindi;
          return (
            <Button
              key={catObj.id}
              size="xs"
              variant={filterCategory === catObj.id ? 'default' : 'outline'}
              onClick={() => setFilterCategory(catObj.id)}
              className="rounded-xl whitespace-nowrap cursor-pointer font-bold"
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center text-[#8C8675] dark:text-slate-400 rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <AlertTriangle className="w-10 h-10 text-[#8C8675] dark:text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white">
            {t('problems.noGrievanceFound')}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComplaints.map((c) => {
            const isDemo = c.isDemo || c.title.includes('DEMO');

            return (
              <Card
                key={c.id}
                className={`p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all rounded-2xl ${
                  isDemo ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#1E3A2F] dark:bg-emerald-950 text-amber-300 dark:text-emerald-300 font-mono border border-[#2D5545] dark:border-emerald-800">
                        {c.id}
                      </span>
                      <Badge variant="secondary" className="text-[10px] rounded-md font-semibold">
                        {c.category}
                      </Badge>
                    </div>

                    <StatusBadge status={c.status} size="xs" />
                  </div>

                  {/* Demo Tag */}
                  {isDemo && (
                    <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-800 dark:text-amber-300">DEMO EXAMPLE</span>
                      {authSession.isAdminLoggedIn && (
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => deleteComplaint(c.id)}
                          className="rounded-lg text-xs"
                        >
                          {t('common.cancel')}
                        </Button>
                      )}
                    </div>
                  )}

                  <h3 className="font-extrabold text-[#2C3327] dark:text-white text-sm mb-1">{c.title}</h3>
                  <p className="text-xs text-[#8C8675] dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">{c.description}</p>

                  {/* Attached Image */}
                  {c.photoUrl && (
                    <div className="mb-3 h-36 rounded-xl overflow-hidden border border-[#E0DCCF] dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900">
                      <img src={c.photoUrl} alt="Complaint Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Location & Reporter Info */}
                  <div className="text-xs text-[#8C8675] dark:text-slate-400 space-y-1 pt-2.5 border-t border-[#E0DCCF] dark:border-slate-800">
                    <p className="flex items-center gap-1 text-[#2C3327] dark:text-slate-200 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <span>{t('problems.locationLabel', { location: c.location })}</span>
                    </p>
                    <p className="flex items-center gap-1 text-[#8C8675] dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        {t('problems.reportedByLabel', { name: c.reporterName })}
                        {authSession.isAdminLoggedIn && c.reporterMobile ? ` (${c.reporterMobile})` : ''}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Controls for Admin or Content Owner Member */}
                {(authSession.isAdminLoggedIn || canDeleteContent(c.reporterMobile, c.villageId)) && (
                  <div className="mt-3 pt-3 border-t border-[#E0DCCF] dark:border-slate-800 flex items-center justify-between gap-2">
                    {authSession.isAdminLoggedIn ? (
                      <select
                        value={c.status}
                        onChange={(e) =>
                          updateComplaintStatus(c.id, e.target.value as ComplaintStatus)
                        }
                        className="text-xs font-bold py-1 px-2 border border-[#E0DCCF] dark:border-slate-700 rounded-lg bg-[#F7F5F0] dark:bg-slate-800 text-[#2C3327] dark:text-white"
                      >
                        <option value="NEW">{t('common.new')} (New)</option>
                        <option value="ACTION IN PROGRESS">{t('common.inProgress')} (In Progress)</option>
                        <option value="RESOLVED">{t('common.resolved')} (Resolved)</option>
                      </select>
                    ) : (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                        ✓ आपकी प्रविष्टि (Your Submission)
                      </span>
                    )}

                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => deleteComplaint(c.id)}
                      className="h-7 px-2.5 rounded-lg cursor-pointer flex items-center gap-1 text-[11px]"
                      title="शिकायत हटाएं (Delete Complaint)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{authSession.isAdminLoggedIn ? '' : 'हटाएं'}</span>
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* New Complaint Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('problems.modalTitle')}
        description={t('problems.modalDesc')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {t('problems.reporterNameLabel')}
            </label>
            <Input
              type="text"
              required
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="उदा. रमेश कुमार"
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
              placeholder="उदा. 9876543210"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.categoryLabel')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full h-10 px-3 rounded-xl border border-[#E0DCCF] dark:border-slate-700 bg-[#FDFBF7] dark:bg-[#0B0F17] text-xs text-[#2C3327] dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORY_MAP.map((catObj) => {
                  const label = lang === 'en' ? catObj.labelEnglish : catObj.labelHindi;
                  return (
                    <option key={catObj.id} value={catObj.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.locationInputLabel')}
              </label>
              <Input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="उदा. मुख्य चौराहा, रसूलपुर"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {t('problems.titleLabel')}
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. सड़क पर जलभराव या ट्रांसफार्मर खराब"
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
              placeholder="समस्या का पूरा विवरण लिखें..."
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {t('problems.uploadPhotoLabel')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-[#8C8675] dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-800 dark:file:text-emerald-300 hover:file:bg-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                वीडियो लिंक (वैकल्पिक)
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

          {msg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl whitespace-pre-line">
              {msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="amber"
              size="sm"
              disabled={submitting}
              className="rounded-xl"
            >
              {submitting ? t('common.loading') : t('common.submit')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
