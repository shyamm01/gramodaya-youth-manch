'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Complaint, ComplaintStatus } from '../../types';
import { AlertTriangle, Building2 } from 'lucide-react';
import { Button } from '../ui';
import {
  GrievanceListHeader,
  GrievanceCategoryFilter,
  GrievanceCard,
  GrievanceFormModal,
  GrievanceDetailModal,
  GrievanceEditModal,
  GrievanceDeleteModal,
  GrievanceEmptyState,
} from '../features/grievance';

export const ProblemsSection: React.FC = () => {
  const {
    complaints: contextComplaints,
    villages,
    activeVillageId,
    submitComplaint,
    editComplaint,
    deleteComplaint,
    updateComplaintStatus,
    authSession,
    isApprovedMember,
    currentMemberMobile,
    canEditContent,
    canDeleteContent,
    t,
    lang,
    villageSettings,
  } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fetchedComplaints, setFetchedComplaints] = useState<Complaint[] | any[] | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unapprovedAlert, setUnapprovedAlert] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('ALL');

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inFlightRef = useRef<Promise<any> | null>(null);

  // Fetch from optimized API with counts
  const fetchComplaints = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;
    const promise = (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/complaints?includeCounts=1&limit=100', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.complaints)) {
            setFetchedComplaints(data.complaints);
            if (data.counts?.byCategory) {
              setCategoryCounts(data.counts.byCategory);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch /api/complaints:', e);
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const complaints: Complaint[] = (fetchedComplaints || contextComplaints) as Complaint[];

  // Auto-open detail modal if ?id= is in query params
  useEffect(() => {
    const idParam = searchParams?.get('id');
    if (idParam && complaints.length > 0 && !selectedComplaint) {
      const match = complaints.find((c) => String(c.id) === String(idParam));
      if (match) {
        setSelectedComplaint(match);
      }
    }
  }, [searchParams, complaints, selectedComplaint]);

  // Filter complaints by Category and Village
  const filteredComplaints = complaints.filter((c) => {
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesVillage =
      selectedVillageFilter === 'ALL' ||
      String(c.villageId) === String(selectedVillageFilter) ||
      (c.villageName && c.villageName.toLowerCase() === selectedVillageFilter.toLowerCase());
    return matchesCategory && matchesVillage;
  });

  const resolvedCount = filteredComplaints.filter((c) => c.status === 'RESOLVED').length;
  const newCount = filteredComplaints.filter((c) => c.status === 'NEW').length;

  const handleRegisterNew = () => {
    if (!authSession.isAdminLoggedIn && !authSession.isMemberLoggedIn) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`);
    } else if (!isApprovedMember) {
      setUnapprovedAlert(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (data: any) => {
    const res = await submitComplaint(data);
    if (res.success) {
      await fetchComplaints();
    }
    return res;
  };

  const handleSaveEdit = async (id: string, updates: Partial<Complaint>) => {
    const res = await editComplaint(id, updates);
    if (res.success) {
      await fetchComplaints();
      // Update the active detail modal view
      setSelectedComplaint((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
      setEditingComplaint(null);
    }
    return res;
  };

  const handleConfirmDelete = async () => {
    if (!deletingComplaint) return;
    setIsDeleting(true);
    try {
      await deleteComplaint(deletingComplaint.id);
      await fetchComplaints();
      if (selectedComplaint?.id === deletingComplaint.id) {
        setSelectedComplaint(null);
      }
      setDeletingComplaint(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    await updateComplaintStatus(id, status);
    await fetchComplaints();
    setSelectedComplaint((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      {/* Header with stats */}
      <GrievanceListHeader
        totalCount={filteredComplaints.length}
        resolvedCount={resolvedCount}
        newCount={newCount}
        t={t}
        lang={lang}
        onRegisterNew={handleRegisterNew}
      />

      {/* Pending Approval Notice Banner */}
      {authSession.isMemberLoggedIn && !isApprovedMember && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">
                {lang === 'en'
                  ? 'Your membership is pending verification/approval.'
                  : 'आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है।'}
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                {lang === 'en'
                  ? 'You can view all grievances and stats. You will be able to file new grievances after admin approval.'
                  : 'आप गांव की सभी शिकायतें, आंकड़े और जानकारी देख सकते हैं। एडमिन द्वारा अनुमोदन के बाद आप नई शिकायतें दर्ज कर सकेंगे।'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for unapproved members */}
      {unapprovedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'en' ? 'Pending Approval' : 'सदस्यता अनुमोदन लंबित'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {lang === 'en'
                ? 'Your membership is being verified by the admin. You can view all public grievances and data. You will be able to file new grievances after approval.'
                : 'आपकी सदस्यता का सत्यापन अभी एडमिन द्वारा किया जा रहा है। आप सभी सार्वजनिक शिकायतें और डेटा देख सकते हैं। अनुमोदन के बाद आप नई शिकायतें दर्ज कर सकेंगे।'}
            </p>
            <Button
              variant="default"
              size="default"
              onClick={() => setUnapprovedAlert(false)}
              className="w-full rounded-xl font-bold cursor-pointer"
            >
              {lang === 'en' ? 'Got It' : 'समझ गया'}
            </Button>
          </div>
        </div>
      )}

      {/* Village Filter Selector Bar (Village-Wise Scoping) */}
      {villages && villages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {lang === 'en' ? 'Village:' : 'ग्राम इकाई:'}
          </span>
          <button
            onClick={() => setSelectedVillageFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedVillageFilter === 'ALL'
                ? 'bg-emerald-900 dark:bg-emerald-800 text-white border-transparent shadow-xs'
                : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }`}
          >
            {lang === 'en' ? 'All Villages' : 'सभी गांव'}
          </button>
          {villages.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVillageFilter(String(v.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                selectedVillageFilter === String(v.id)
                  ? 'bg-emerald-900 dark:bg-emerald-800 text-white border-transparent shadow-xs'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
              }`}
            >
              {lang === 'en' ? v.name : v.nameHindi}
            </button>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <GrievanceCategoryFilter
        activeCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        categoryCounts={categoryCounts || undefined}
        complaints={filteredComplaints}
        lang={lang}
        t={t}
      />

      {/* Complaints Cards Grid */}
      {filteredComplaints.length === 0 ? (
        <GrievanceEmptyState lang={lang} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredComplaints.map((c, idx) => (
            <GrievanceCard
              key={c.id}
              complaint={c}
              isAdmin={authSession.isAdminLoggedIn}
              isMemberOwner={canEditContent(c.reporterMobile, c.villageId)}
              lang={lang}
              t={t}
              onSelect={(selected) => router.push(`/problems/${selected.id}`)}
              index={idx}
            />
          ))}
        </div>
      )}

      {/* New Grievance Modal */}
      <GrievanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        t={t}
        lang={lang}
        defaultVillageId={selectedVillageFilter !== 'ALL' ? selectedVillageFilter : (activeVillageId || '1')}
        villages={villages}
        defaultLocation={lang === 'en' ? (villageSettings.name || '') : (villageSettings.nameHindi || '')}
        currentUserId={authSession.currentMemberId || authSession.currentMember?.id || authSession.adminId || authSession.supabaseUserId}
        currentUserName={authSession.currentMemberName || authSession.adminName || authSession.currentMember?.name || ''}
        currentUserMobile={currentMemberMobile || authSession.adminMobile || ''}
      />

      {/* Grievance Detail View Modal */}
      <GrievanceDetailModal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
        isAdmin={authSession.isAdminLoggedIn}
        isAuthor={selectedComplaint ? canEditContent(selectedComplaint.reporterMobile, selectedComplaint.villageId) : false}
        lang={lang}
        t={t}
        onEdit={(comp) => setEditingComplaint(comp)}
        onDelete={(comp) => setDeletingComplaint(comp)}
        onStatusChange={authSession.isAdminLoggedIn ? handleStatusChange : undefined}
      />

      {/* Grievance Edit Modal */}
      <GrievanceEditModal
        isOpen={!!editingComplaint}
        onClose={() => setEditingComplaint(null)}
        complaint={editingComplaint}
        villages={villages}
        onSave={handleSaveEdit}
        lang={lang}
        t={t}
      />

      {/* Grievance Delete Confirmation Modal */}
      <GrievanceDeleteModal
        isOpen={!!deletingComplaint}
        onClose={() => setDeletingComplaint(null)}
        onConfirm={handleConfirmDelete}
        complaintTitle={deletingComplaint?.title || ''}
        lang={lang}
        isDeleting={isDeleting}
      />
    </div>
  );
};
