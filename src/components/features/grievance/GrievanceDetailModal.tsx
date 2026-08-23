'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Calendar,
  Share2,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../../types';
import { Button, Badge } from '../../ui';
import { StatusBadge } from '../../common/EntityLabels';
import { GrievancePriorityBadge } from './GrievancePriorityBadge';
import { getCategoryLabel } from './GrievanceCategoryFilter';
import { getGrievanceFallbackImage } from '../../../lib/defaultImages';

interface GrievanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | any;
  isAdmin: boolean;
  isAuthor: boolean;
  lang: string;
  t: (key: string, opts?: any) => string;
  onEdit?: (complaint: Complaint) => void;
  onDelete?: (complaint: Complaint) => void;
  onStatusChange?: (id: string | number, status: ComplaintStatus) => Promise<void>;
}

export const GrievanceDetailModal: React.FC<GrievanceDetailModalProps> = ({
  isOpen,
  onClose,
  complaint: c,
  isAdmin,
  isAuthor,
  lang,
  t,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const displayTitle = lang === 'hi' ? (c?.titleHindi || c?.title) : (c?.title || c?.titleHindi);
  const displayDesc = lang === 'hi' ? (c?.descriptionHindi || c?.description) : (c?.description || c?.descriptionHindi);
  const displayLocation = lang === 'hi' ? (c?.locationHindi || c?.location) : (c?.location || c?.locationHindi);
  const displayWard = lang === 'hi' ? (c?.wardHindi || c?.ward) : (c?.ward || c?.wardHindi);

  if (!isOpen || !c) return null;

  const fallbackImg = getGrievanceFallbackImage(c?.category);
  const primaryPhoto = c.attachments?.[0]?.url || c.photoUrl || fallbackImg;
  const locale = lang === 'en' ? 'en-IN' : 'hi-IN';

  const handleShare = async () => {
    const url = window.location.origin + `/problems?id=${c.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusSelect = async (newStatus: ComplaintStatus) => {
    if (!onStatusChange || newStatus === c.status) return;
    setUpdatingStatus(true);
    await onStatusChange(c.id, newStatus);
    setUpdatingStatus(false);
  };

  const isNew = c.status === 'NEW';
  const isInProgress = c.status === 'ACTION IN PROGRESS';
  const isResolved = c.status === 'RESOLVED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs rounded-lg font-bold">
              {getCategoryLabel(c.category, lang)}
            </Badge>
            <GrievancePriorityBadge priority={c.priority || 'medium'} lang={lang} size="sm" />
            <StatusBadge status={c.status} size="sm" lang={lang} />
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Grievance Title */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 w-fit px-2.5 py-0.5 rounded-md mb-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? (c.villageName || c.village?.name || 'Rasoolpur') : (c.villageNameHindi || c.village?.nameHindi || 'रसूलपुर')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white leading-tight">
              {displayTitle}
            </h3>
          </div>

          {/* Stepper Timeline */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#151C2C] border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              {lang === 'en' ? 'Resolution Stepper' : 'निस्तारण प्रक्रिया'}
            </h4>
            <div className="grid grid-cols-3 gap-2 relative">
              <div className="absolute top-3.5 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-700 -z-0">
                <div
                  className={`h-full bg-emerald-500 transition-all duration-300 ${
                    isResolved ? 'w-full' : isInProgress ? 'w-1/2' : 'w-0'
                  }`}
                />
              </div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px] mb-1.5 shadow-sm">
                  ✓
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {lang === 'en' ? 'Submitted' : 'दर्ज की गई'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1.5 transition-all ${
                    isInProgress || isResolved
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isResolved ? '✓' : '2'}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isInProgress || isResolved
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {lang === 'en' ? 'In Progress' : 'प्रक्रियाधीन'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1.5 transition-all ${
                    isResolved
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isResolved ? '✓' : '3'}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isResolved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {lang === 'en' ? 'Resolved' : 'निस्तारित'}
                </span>
                {c.resolvedAt && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {new Date(c.resolvedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo Attachment */}
          <div
            className="rounded-2xl overflow-hidden border border-[#E0DCCF] dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900 cursor-pointer group/img relative"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={primaryPhoto}
              alt={lang === 'en' ? 'Grievance Photo' : 'समस्या की फोटो'}
              onError={(e) => {
                if (e.currentTarget.src !== fallbackImg) {
                  e.currentTarget.src = fallbackImg;
                }
              }}
              className="w-full max-h-72 object-cover transition-transform duration-300 group-hover/img:scale-[1.01]"
            />
            <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
              🔍 {lang === 'en' ? 'Click to zoom' : 'बड़ा करके देखें'}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#8C8675] dark:text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Problem Details' : 'समस्या का पूरा विवरण'}
            </h4>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-[#E0DCCF] dark:border-slate-800 text-xs sm:text-sm text-[#2C3327] dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {displayDesc}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Village Card */}
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#111726] border border-[#E0DCCF] dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {lang === 'en' ? 'Village Chapter' : 'ग्राम इकाई'}
              </span>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-semibold">
                {lang === 'en' ? (c.villageName || c.village?.name || 'Rasoolpur') : (c.villageNameHindi || c.village?.nameHindi || 'रसूलपुर')}
              </p>
            </div>

            {/* Location Card */}
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#111726] border border-[#E0DCCF] dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {lang === 'en' ? 'Location & Ward' : 'स्थान व वार्ड'}
              </span>
              <p className="text-xs font-bold text-[#2C3327] dark:text-white">
                {displayLocation}
                {displayWard ? `, ${displayWard}` : ''}
              </p>
            </div>

            {/* Reporter Card */}
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#111726] border border-[#E0DCCF] dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {lang === 'en' ? 'Reported By' : 'दर्जकर्ता'}
              </span>
              <p className="text-xs font-bold text-[#2C3327] dark:text-white">
                {c.reporterName}
                {(isAdmin || isAuthor) && c.reporterMobile ? ` (${c.reporterMobile})` : ''}
              </p>
            </div>

            {/* Date Card */}
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] dark:bg-[#111726] border border-[#E0DCCF] dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {lang === 'en' ? 'Reported Date' : 'दर्ज दिनांक'}
              </span>
              <p className="text-xs font-bold text-[#2C3327] dark:text-white font-mono">
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#131927]/80 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap">
          {/* Admin Status Transition Selector */}
          {isAdmin && onStatusChange ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
                {lang === 'en' ? 'Status:' : 'स्थिति:'}
              </span>
              <select
                value={c.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusSelect(e.target.value as ComplaintStatus)}
                className="text-xs font-bold py-1.5 px-3 border border-[#E0DCCF] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white cursor-pointer hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NEW">{lang === 'en' ? 'New' : 'नवीन'}</option>
                <option value="ACTION IN PROGRESS">{lang === 'en' ? 'In Progress' : 'प्रक्रियाधीन'}</option>
                <option value="RESOLVED">{lang === 'en' ? 'Resolved' : 'निस्तारित'}</option>
              </select>
            </div>
          ) : (
            <div />
          )}

          {/* User / Admin Action Buttons: Edit, Delete, Close */}
          <div className="flex items-center gap-2 ml-auto">
            {(isAdmin || isAuthor) && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(c)}
                  className="rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Edit' : 'संपादित करें'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(c)}
                  className="rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Delete' : 'हटाएं'}</span>
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="default"
              onClick={onClose}
              className="rounded-xl font-bold cursor-pointer"
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox for Full View */}
      {lightboxOpen && primaryPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={primaryPhoto} alt="Full view" className="w-full h-full object-contain" />
            <button
              className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors text-sm font-bold"
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
