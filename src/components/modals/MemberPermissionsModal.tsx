'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Save,
  X,
  Lock,
  Layers,
  Search,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Building2,
  Users,
  AlertCircle,
  HeartHandshake,
  Calendar,
  Image as ImageIcon,
  Megaphone,
  FileText,
  UserCheck,
  GraduationCap,
  MessageSquare,
  Activity,
  Settings,
} from 'lucide-react';
import { Member, UserModulePermission } from '@/src/types';
import { useApp } from '@/src/context/AppContext';

interface MemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess?: () => void;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  village: <Building2 className="w-4 h-4" />,
  members: <Users className="w-4 h-4" />,
  complaints: <AlertCircle className="w-4 h-4" />,
  social_works: <HeartHandshake className="w-4 h-4" />,
  events: <Calendar className="w-4 h-4" />,
  gallery: <ImageIcon className="w-4 h-4" />,
  announcements: <Megaphone className="w-4 h-4" />,
  public_info: <FileText className="w-4 h-4" />,
  elders: <UserCheck className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
  audit: <Activity className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
};

const CANONICAL_SYSTEM_MODULES: UserModulePermission[] = [
  { moduleId: '1', moduleSlug: 'village', moduleName: 'Village Management', moduleNameHindi: 'ग्राम प्रबंधन', description: 'Multi-village governance, chapter configurations, and geographical units', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '2', moduleSlug: 'members', moduleName: 'Members & Approvals', moduleNameHindi: 'सदस्यता एवं अनुमोदन', description: 'Member directory, verification workflows, and role assignments', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '3', moduleSlug: 'complaints', moduleName: 'Complaints & Grievances', moduleNameHindi: 'जन समस्या एवं शिकायत निवारण', description: 'Grievance logging, administrative triage, and status resolution', canRead: true, canWrite: true, canUpdate: false, canDelete: false },
  { moduleId: '4', moduleSlug: 'social_works', moduleName: 'Social Development Works', moduleNameHindi: 'सामाजिक विकास कार्य', description: 'Community welfare initiatives, development projects, and ground impact', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '5', moduleSlug: 'events', moduleName: 'Village Events', moduleNameHindi: 'ग्राम कार्यक्रम व सभाएं', description: 'Community meetings, festival gatherings, and program scheduling', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '6', moduleSlug: 'gallery', moduleName: 'Media Gallery', moduleNameHindi: 'चित्रशाला एवं मीडिया', description: 'Photo and media archive, event snapshots, and village gallery', canRead: true, canWrite: true, canUpdate: false, canDelete: false },
  { moduleId: '7', moduleSlug: 'announcements', moduleName: 'Announcements & Alerts', moduleNameHindi: 'सूचना एवं प्रसारण', description: 'Official public notices, alerts, and village broadcasts', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '8', moduleSlug: 'public_info', moduleName: 'Public Information Board', moduleNameHindi: 'सार्वजनिक सूचना पट्ट', description: 'Transparency reports, public documents, and civic notices', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '9', moduleSlug: 'elders', moduleName: 'Elder Care & Respect', moduleNameHindi: 'बुजुर्ग सम्मान एवं देखरेख', description: 'Senior citizen directory, honors, and elder care assistance', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '10', moduleSlug: 'education', moduleName: 'Education & Career Guidance', moduleNameHindi: 'शिक्षा एवं मार्गदर्शन', description: 'Scholarships, government schemes, and career counseling', canRead: true, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '11', moduleSlug: 'chat', moduleName: 'Community Live Chat', moduleNameHindi: 'सामुदायिक लाइव चैट', description: 'Real-time community discussions and direct communication', canRead: true, canWrite: true, canUpdate: false, canDelete: false },
  { moduleId: '12', moduleSlug: 'audit', moduleName: 'Audit & Activity Logs', moduleNameHindi: 'ऑडिट एवं गतिविधि लॉग्स', description: 'Security tracking, administrative activity history, and audit logs', canRead: false, canWrite: false, canUpdate: false, canDelete: false },
  { moduleId: '13', moduleSlug: 'settings', moduleName: 'Settings & Permissions Matrix', moduleNameHindi: 'सिस्टम सेटिंग्स व अनुमतियां', description: 'User permissions matrix and system configuration settings', canRead: false, canWrite: false, canUpdate: false, canDelete: false },
];

export const MemberPermissionsModal: React.FC<MemberPermissionsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const { authSession } = useApp();
  const [modulePermissions, setModulePermissions] = useState<UserModulePermission[]>(CANONICAL_SYSTEM_MODULES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && member?.id) {
      setLoading(true);
      setStatusMsg(null);

      // Baseline initialization
      const isSuper = member.systemRole === 'SUPER_ADMIN';
      const isAdmin = member.systemRole === 'ADMIN' || member.role === 'ADMIN';

      const initial = CANONICAL_SYSTEM_MODULES.map((mod) => {
        if (isSuper) {
          return { ...mod, canRead: true, canWrite: true, canUpdate: true, canDelete: true };
        }
        if (isAdmin) {
          const isCore = mod.moduleSlug === 'audit' || mod.moduleSlug === 'settings';
          return { ...mod, canRead: true, canWrite: !isCore, canUpdate: !isCore, canDelete: !isCore };
        }
        const canWrite = ['complaints', 'gallery', 'chat'].includes(mod.moduleSlug);
        return { ...mod, canRead: true, canWrite, canUpdate: false, canDelete: false };
      });
      setModulePermissions(initial);

      fetch(`/api/permissions/${member.id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.modules) && data.modules.length > 0) {
            setModulePermissions(data.modules);
          }
        })
        .catch((err) => {
          console.error('Error fetching member permissions:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, member?.id, member?.systemRole]);

  const isSuperAdminUser = member?.systemRole === 'SUPER_ADMIN';

  // Toggle individual CRUD action for a module
  const toggleCrud = (
    moduleId: string | number,
    action: 'canRead' | 'canWrite' | 'canUpdate' | 'canDelete'
  ) => {
    if (isSuperAdminUser) return;
    setModulePermissions((prev) =>
      prev.map((mod) => {
        if (String(mod.moduleId) === String(moduleId)) {
          return {
            ...mod,
            [action]: !mod[action],
            isCustom: true,
          };
        }
        return mod;
      })
    );
  };

  // Toggle full CRUD for a single module
  const toggleModuleAll = (moduleId: string | number) => {
    if (isSuperAdminUser) return;
    setModulePermissions((prev) =>
      prev.map((mod) => {
        if (String(mod.moduleId) === String(moduleId)) {
          const allActive = mod.canRead && mod.canWrite && mod.canUpdate && mod.canDelete;
          return {
            ...mod,
            canRead: !allActive,
            canWrite: !allActive,
            canUpdate: !allActive,
            canDelete: !allActive,
            isCustom: true,
          };
        }
        return mod;
      })
    );
  };

  // Apply Quick Preset Templates
  const applyPreset = (preset: 'viewer' | 'volunteer' | 'moderator' | 'admin' | 'all') => {
    if (isSuperAdminUser) return;
    setModulePermissions((prev) =>
      prev.map((mod) => {
        const slug = mod.moduleSlug;
        if (preset === 'viewer') {
          return { ...mod, canRead: true, canWrite: false, canUpdate: false, canDelete: false, isCustom: true };
        }
        if (preset === 'volunteer') {
          const canWrite = ['complaints', 'gallery', 'social_works', 'events', 'chat'].includes(slug);
          return { ...mod, canRead: true, canWrite, canUpdate: false, canDelete: false, isCustom: true };
        }
        if (preset === 'moderator') {
          const canWrite = ['complaints', 'gallery', 'social_works', 'events', 'chat', 'announcements', 'elders'].includes(slug);
          const canUpdate = ['complaints', 'gallery', 'social_works', 'events', 'chat', 'announcements', 'elders'].includes(slug);
          return { ...mod, canRead: true, canWrite, canUpdate, canDelete: false, isCustom: true };
        }
        if (preset === 'admin') {
          const isCoreSystem = slug === 'audit' || slug === 'settings';
          return {
            ...mod,
            canRead: true,
            canWrite: !isCoreSystem,
            canUpdate: !isCoreSystem,
            canDelete: !isCoreSystem,
            isCustom: true,
          };
        }
        if (preset === 'all') {
          return { ...mod, canRead: true, canWrite: true, canUpdate: true, canDelete: true, isCustom: true };
        }
        return mod;
      })
    );
  };

  // Save Permissions to Backend API
  const handleSave = async () => {
    if (!member?.id || isSuperAdminUser) return;
    try {
      setSaving(true);
      setStatusMsg(null);

      const payload = {
        permissions: modulePermissions.map((m) => ({
          moduleId: m.moduleId,
          moduleSlug: m.moduleSlug,
          canRead: m.canRead,
          canWrite: m.canWrite,
          canUpdate: m.canUpdate,
          canDelete: m.canDelete,
        })),
      };

      const res = await fetch(`/api/permissions/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save permissions');
      }

      setStatusMsg({ type: 'success', text: 'Permissions saved successfully!' });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error updating permissions:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Error occurred while saving permissions' });
    } finally {
      setSaving(false);
    }
  };

  // Filter modules by search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modulePermissions;
    const q = searchQuery.toLowerCase().trim();
    return modulePermissions.filter(
      (m) =>
        m.moduleName?.toLowerCase().includes(q) ||
        m.moduleSlug?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    );
  }, [modulePermissions, searchQuery]);

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0E131F] rounded-2xl shadow-2xl border border-[#E0DCCF] dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0DCCF] dark:border-slate-800/80 flex items-center justify-between bg-[#F8F6F0] dark:bg-[#070B14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-purple-900/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2C3327] dark:text-white flex items-center gap-2 flex-wrap">
                <span>User Module Permissions (CRUD Matrix)</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {member.name}
                </span>
              </h3>
              <p className="text-[11px] text-[#8C8675] dark:text-slate-400 font-medium">
                System Role: <strong className="text-slate-800 dark:text-slate-200">{member.systemRole}</strong> • Mobile: {member.mobile || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Notice */}
        {isSuperAdminUser && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Super Admin Privilege:</strong> This user automatically possesses full unrestricted CRUD (Read, Write, Update, Delete) permissions across all 13 canonical system modules.
            </span>
          </div>
        )}

        {/* Quick Presets & Search Toolbar */}
        {!isSuperAdminUser && (
          <div className="px-4 py-3 border-b border-[#E0DCCF]/60 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-purple-500" /> Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('viewer')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                👁️ Viewer
              </button>
              <button
                type="button"
                onClick={() => applyPreset('volunteer')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                ➕ Volunteer
              </button>
              <button
                type="button"
                onClick={() => applyPreset('moderator')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                ✏️ Moderator
              </button>
              <button
                type="button"
                onClick={() => applyPreset('admin')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                👑 Village Admin
              </button>
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition cursor-pointer"
              >
                ⭐ Full CRUD
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* CRUD Table Matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500 font-medium animate-pulse">
              Loading module permissions...
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#111827]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 min-w-[220px]">System Module</th>
                      <th className="py-3 px-3 text-center w-24">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3 text-blue-500" /> Read
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center w-24">
                        <div className="flex items-center justify-center gap-1">
                          <PlusCircle className="w-3 h-3 text-emerald-500" /> Write
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center w-24">
                        <div className="flex items-center justify-center gap-1">
                          <Edit3 className="w-3 h-3 text-amber-500" /> Update
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center w-24">
                        <div className="flex items-center justify-center gap-1">
                          <Trash2 className="w-3 h-3 text-rose-500" /> Delete
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right w-28">All Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredModules.map((mod) => {
                      const isAllActive = mod.canRead && mod.canWrite && mod.canUpdate && mod.canDelete;

                      return (
                        <tr
                          key={mod.moduleId}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                        >
                          {/* Module Identity */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-200/60 dark:border-purple-900/40">
                                {MODULE_ICONS[mod.moduleSlug] || <Layers className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs">
                                  {mod.moduleName}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  slug: {mod.moduleSlug}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Read (👁️) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              disabled={isSuperAdminUser}
                              onClick={() => toggleCrud(mod.moduleId, 'canRead')}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                                mod.canRead
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              } ${isSuperAdminUser ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                              title={mod.canRead ? 'Read enabled' : 'Read disabled'}
                            >
                              {mod.canRead ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </td>

                          {/* Write (➕) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              disabled={isSuperAdminUser}
                              onClick={() => toggleCrud(mod.moduleId, 'canWrite')}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                                mod.canWrite
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              } ${isSuperAdminUser ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                              title={mod.canWrite ? 'Write enabled' : 'Write disabled'}
                            >
                              {mod.canWrite ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <PlusCircle className="w-3.5 h-3.5" />}
                            </button>
                          </td>

                          {/* Update (✏️) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              disabled={isSuperAdminUser}
                              onClick={() => toggleCrud(mod.moduleId, 'canUpdate')}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                                mod.canUpdate
                                  ? 'bg-amber-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              } ${isSuperAdminUser ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                              title={mod.canUpdate ? 'Update enabled' : 'Update disabled'}
                            >
                              {mod.canUpdate ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Edit3 className="w-3.5 h-3.5" />}
                            </button>
                          </td>

                          {/* Delete (🗑️) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              disabled={isSuperAdminUser}
                              onClick={() => toggleCrud(mod.moduleId, 'canDelete')}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                                mod.canDelete
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              } ${isSuperAdminUser ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                              title={mod.canDelete ? 'Delete enabled' : 'Delete disabled'}
                            >
                              {mod.canDelete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </td>

                          {/* Row All Toggle */}
                          <td className="py-3 px-4 text-right">
                            {!isSuperAdminUser && (
                              <button
                                type="button"
                                onClick={() => toggleModuleAll(mod.moduleId)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                                  isAllActive
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {isAllActive ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E0DCCF] dark:border-slate-800 flex items-center justify-between bg-[#F8F6F0] dark:bg-[#070B14]">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Total Modules:{' '}
            <strong className="text-purple-700 dark:text-purple-400">
              {filteredModules.length}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Close
            </button>
            {!isSuperAdminUser && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
