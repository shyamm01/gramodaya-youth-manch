'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Phone,
  User,
  Clock,
  Share2,
  Check,
  Edit,
  Trash2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  FileText,
  History,
  AlertTriangle,
  RefreshCw,
  ImageIcon,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { Complaint, ComplaintPriority, ComplaintStatus } from '@/src/types';
import { Card, Badge, Button } from '../ui';
import { StatusBadge } from '../common/EntityLabels';
import { GrievancePriorityBadge } from '../features/grievance/GrievancePriorityBadge';
import { getCategoryLabel } from '../features/grievance/GrievanceCategoryFilter';
import { GrievanceEditModal } from '../features/grievance/GrievanceEditModal';
import { GrievanceDeleteModal } from '../features/grievance/GrievanceDeleteModal';
import { getGrievanceFallbackImage } from '@/src/lib/defaultImages';

interface GrievanceDetailPageProps {
  id: string;
}

export const GrievanceDetailPage: React.FC<GrievanceDetailPageProps> = ({ id }) => {
  const router = useRouter();
  const {
    authSession,
    canEditContent,
    canDeleteContent,
    editComplaint,
    deleteComplaint,
    updateComplaintStatus,
    villages,
    lang,
    t,
  } = useApp();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Language based content selection with fallback
  const displayTitle = lang === 'hi' ? (complaint?.titleHindi || complaint?.title) : (complaint?.title || complaint?.titleHindi);
  const displayDesc = lang === 'hi' ? (complaint?.descriptionHindi || complaint?.description) : (complaint?.description || complaint?.descriptionHindi);
  const displayLocation = lang === 'hi' ? (complaint?.locationHindi || complaint?.location) : (complaint?.location || complaint?.locationHindi);
  const displayWard = lang === 'hi' ? (complaint?.wardHindi || complaint?.ward) : (complaint?.ward || complaint?.wardHindi);

  // Status transition state for Admin
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Edit / Delete modal states
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/complaints/${id}`, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 404) {
          setError(lang === 'en' ? 'Grievance not found' : 'शिकायत नहीं मिली');
        } else {
          setError(lang === 'en' ? 'Failed to load grievance details' : 'विवरण लोड करने में असमर्थ');
        }
        return;
      }
      const data = await res.json();
      if (data.success && data.complaint) {
        setComplaint(data.complaint);
        setNewStatus(data.complaint.status);
      } else {
        setError(data.error || (lang === 'en' ? 'Failed to load grievance' : 'लोड करने में विफल'));
      }
    } catch (e: any) {
      setError(e.message || (lang === 'en' ? 'An unexpected error occurred' : 'अज्ञात त्रुटि'));
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleStatusUpdate = async () => {
    if (!complaint || !newStatus || newStatus === complaint.status) return;
    setUpdatingStatus(true);
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      setStatusNote('');
      await fetchDetail();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async (cId: string, updates: Partial<Complaint>) => {
    const res = await editComplaint(cId, updates);
    if (res.success) {
      await fetchDetail();
      setIsEditOpen(false);
    }
    return res;
  };

  const handleConfirmDelete = async () => {
    if (!complaint) return;
    setIsDeleting(true);
    try {
      await deleteComplaint(complaint.id);
      setIsDeleteOpen(false);
      router.push('/problems');
    } catch (err) {
      console.error('Failed to delete complaint:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          {lang === 'en' ? 'Loading grievance details...' : 'शिकायत का विवरण लोड हो रहा है...'}
        </p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {error || (lang === 'en' ? 'Grievance not found' : 'शिकायत नहीं मिली')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {lang === 'en'
              ? 'The grievance you are looking for may have been deleted, resolved, or is inaccessible.'
              : 'जिस शिकायत को आप खोज रहे हैं वह हटा दी गई हो सकती है या उपलब्ध नहीं है।'}
          </p>
          <div className="pt-2">
            <Link href="/problems">
              <Button variant="default" className="rounded-xl font-bold">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {lang === 'en' ? 'Back to All Grievances' : 'सभी शिकायतों पर वापस जाएं'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = canEditContent(complaint.reporterMobile, complaint.villageId);
  const isAdmin = authSession.isAdminLoggedIn;
  const canModify = isAuthor || isAdmin;

  const villageDisplayName = lang === 'en'
    ? (complaint.villageName || complaint.village?.name || 'Rasoolpur')
    : (complaint.villageNameHindi || complaint.village?.nameHindi || 'रसूलपुर');

  const locale = lang === 'en' ? 'en-IN' : 'hi-IN';
  const fallbackImg = getGrievanceFallbackImage(complaint.category);
  const primaryPhoto = complaint.attachments?.[0]?.url || complaint.photoUrl || fallbackImg;

  const isNew = complaint.status === 'NEW';
  const isInProgress = complaint.status === 'ACTION IN PROGRESS';
  const isResolved = complaint.status === 'RESOLVED';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link
            href="/"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium"
          >
            {lang === 'en' ? 'Home' : 'मुख्य पृष्ठ'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href="/problems"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium"
          >
            {lang === 'en' ? 'Grievances' : 'ग्राम समस्याएं'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            #{complaint.id}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/problems">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              {lang === 'en' ? 'Back' : 'वापस'}
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {lang === 'en' ? 'Copied' : 'कॉपी हुआ'}
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1" />
                {lang === 'en' ? 'Share' : 'शेयर'}
              </>
            )}
          </Button>

          {canModify && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="rounded-xl text-xs font-bold border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                {lang === 'en' ? 'Edit' : 'संपादित करें'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="rounded-xl text-xs font-bold border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {lang === 'en' ? 'Delete' : 'हटाएं'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Page Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Primary Details & Media (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-black text-amber-300 dark:text-emerald-300 border border-slate-700 dark:border-slate-800">
                #{complaint.id}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {villageDisplayName}
              </span>
              <Badge variant="secondary" className="text-xs rounded-lg font-bold px-2.5 py-1">
                {getCategoryLabel(complaint.category, lang)}
              </Badge>
              <GrievancePriorityBadge priority={complaint.priority || 'medium'} lang={lang} size="sm" />
              <StatusBadge status={complaint.status} size="sm" lang={lang} />
            </div>

            {/* Grievance Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {displayTitle}
            </h1>

            {/* Quick Metadata info bar */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                {displayLocation}
                {displayWard ? `, ${displayWard}` : ''}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {complaint.createdAt
                  ? new Date(complaint.createdAt).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {complaint.reporterName}
              </span>
            </div>
          </div>

          {/* 3-Step Resolution Stepper Timeline */}
          <div className="p-6 sm:p-7 bg-[#FAF9F5] dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
              {lang === 'en' ? 'Resolution Progress' : 'निस्तारण प्रक्रिया की स्थिति'}
            </h3>

            <div className="grid grid-cols-3 gap-2 relative">
              {/* Connector Bar */}
              <div className="absolute top-4 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
                <div
                  className={`h-full bg-emerald-500 transition-all duration-500 ${
                    isResolved ? 'w-full' : isInProgress ? 'w-1/2' : 'w-0'
                  }`}
                />
              </div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mb-2 shadow-md shadow-emerald-500/20">
                  ✓
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {lang === 'en' ? 'Submitted' : 'दर्ज की गई'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
                    : ''}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isInProgress || isResolved
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isResolved ? '✓' : '2'}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isInProgress || isResolved
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {lang === 'en' ? 'In Progress' : 'प्रक्रियाधीन'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isResolved
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isResolved ? '✓' : '3'}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isResolved ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {lang === 'en' ? 'Resolved' : 'निस्तारित'}
                </span>
                {complaint.resolvedAt && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {new Date(complaint.resolvedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery Showcase */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Attached Photo / Evidence' : 'संलग्न फोटो / प्रमाण'}
            </h3>
            <div
              className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer group shadow-sm max-h-96"
              onClick={() => setLightboxUrl(primaryPhoto)}
            >
              <img
                src={primaryPhoto}
                alt={complaint.title}
                onError={(e) => {
                  if (e.currentTarget.src !== fallbackImg) {
                    e.currentTarget.src = fallbackImg;
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 max-h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  {lang === 'en' ? 'Click to view full photo' : 'बड़ा फ़ोटो देखने के लिए क्लिक करें'}
                </span>
              </div>
            </div>

            {/* Extra attachments if any */}
            {complaint.attachments && complaint.attachments.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {complaint.attachments.map((att, i) => (
                  <button
                    key={att.id || i}
                    onClick={() => setLightboxUrl(att.url)}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex-shrink-0 hover:border-emerald-500 transition-all cursor-pointer"
                  >
                    <img
                      src={att.url}
                      alt=""
                      onError={(e) => {
                        if (e.currentTarget.src !== fallbackImg) {
                          e.currentTarget.src = fallbackImg;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              {lang === 'en' ? 'Problem Description' : 'समस्या का विस्तृत विवरण'}
            </h3>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {displayDesc}
            </p>
          </div>

          {/* Audit / Status History Log */}
          {complaint.statusHistory && complaint.statusHistory.length > 0 && (
            <div className="p-6 sm:p-8 bg-[#FAF9F5] dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-600" />
                {lang === 'en' ? 'Activity & Status History' : 'गतिविधि व स्थिति इतिहास'}
              </h3>
              <div className="space-y-3 border-l-2 border-slate-200 dark:border-slate-800 ml-2 pl-4">
                {complaint.statusHistory.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative space-y-1">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0E131F]" />
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {hist.toStatus}
                      </span>
                      {hist.createdAt && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(hist.createdAt).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {hist.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        &ldquo;{hist.note}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Metadata Sidebar & Actions (Span 1) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-6 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Grievance Information' : 'समस्या संबंधी विवरण'}
            </h3>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {/* Village Chapter */}
              <div className="pt-2 flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'en' ? 'Village Chapter' : 'ग्राम इकाई'}
                </span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-right">
                  {villageDisplayName}
                </span>
              </div>

              {/* Location */}
              <div className="pt-3 flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {lang === 'en' ? 'Location' : 'स्थान'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                  {displayLocation}
                  {displayWard ? `, ${displayWard}` : ''}
                </span>
              </div>

              {/* Reporter Name */}
              <div className="pt-3 flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {lang === 'en' ? 'Reported By' : 'दर्जकर्ता'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                  {complaint.reporterName}
                </span>
              </div>

              {/* Reporter Contact (if authorized) */}
              {(isAdmin || isAuthor) && complaint.reporterMobile && (
                <div className="pt-3 flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    {lang === 'en' ? 'Mobile' : 'मोबाइल'}
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {complaint.reporterMobile}
                  </span>
                </div>
              )}

              {/* Reported Date */}
              <div className="pt-3 flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  {lang === 'en' ? 'Filed Date' : 'दर्ज दिनांक'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-right">
                  {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </span>
              </div>

              {/* Resolved Date if applicable */}
              {complaint.resolvedAt && (
                <div className="pt-3 flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'en' ? 'Resolved On' : 'निस्तारण दिनांक'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-right">
                    {new Date(complaint.resolvedAt).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Management Box */}
          {isAdmin && (
            <div className="p-6 bg-slate-50 dark:bg-[#131927] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {lang === 'en' ? 'Admin Action & Status' : 'एडमिन प्रबंधन'}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {lang === 'en' ? 'Change Status' : 'स्थिति बदलें'}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="NEW">{lang === 'en' ? 'New (Open)' : 'नवीन (खुली)'}</option>
                    <option value="ACTION IN PROGRESS">{lang === 'en' ? 'In Progress' : 'प्रक्रियाधीन'}</option>
                    <option value="RESOLVED">{lang === 'en' ? 'Resolved' : 'निस्तारित'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {lang === 'en' ? 'Update Note (Optional)' : 'टिप्पणी / विवरण (वैकल्पिक)'}
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Officer dispatched to location' : 'उदा. अधिकारी मौके पर भेजे गए'}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || !newStatus || newStatus === complaint.status}
                  className="w-full rounded-xl text-xs font-bold cursor-pointer"
                >
                  {updatingStatus
                    ? (lang === 'en' ? 'Updating...' : 'अपडेट हो रहा है...')
                    : (lang === 'en' ? 'Update Status' : 'स्थिति अपडेट करें')}
                </Button>
              </div>
            </div>
          )}

          {/* Citizen Helpdesk Card */}
          <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 rounded-3xl space-y-3">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'en' ? 'Village Helpdesk' : 'ग्राम हेल्पडेस्क'}
            </h4>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
              {lang === 'en'
                ? 'For urgent community issues or direct escalation, contact your village representative or youth council coordinator.'
                : 'अत्यावश्यक सहायता या सीधे संपर्क हेतु अपनी ग्राम इकाई के युवा मंच प्रतिनिधि से संपर्क करें।'}
            </p>
            <Link href="/helpline" className="inline-block pt-1">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                {lang === 'en' ? 'View Village Contacts →' : 'ग्राम संपर्क सूत्र देखें →'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <img
              src={lightboxUrl}
              alt="Enlarged grievance proof"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm cursor-pointer"
            >
              ✕ {lang === 'en' ? 'Close' : 'बंद करें'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <GrievanceEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        complaint={complaint}
        villages={villages}
        onSave={handleSaveEdit}
        lang={lang}
        t={t}
      />

      {/* Delete Confirmation Modal */}
      <GrievanceDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        complaintTitle={complaint.title}
        lang={lang}
        isDeleting={isDeleting}
      />
    </div>
  );
};
