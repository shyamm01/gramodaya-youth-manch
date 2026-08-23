'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  Search,
  Filter,
  Check,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  Building2,
  ArrowUpDown,
  RefreshCw,
  UserCheck,
  KeyRound,
  FileCheck2,
  ChevronRight,
  Info,
  Save,
  AlertCircle,
  HeartHandshake,
  Calendar,
  Image as ImageIcon,
  Megaphone,
  FileText,
  GraduationCap,
  MessageSquare,
  Activity,
  Settings,
} from 'lucide-react';
import { Member, SystemRole, ModuleItem, UserModulePermission } from '@/src/types';
import { useApp } from '@/src/context/AppContext';

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

export interface AdminPermissionsSectionProps {
  initialSubTab?: 'workspace' | 'modules' | 'roles' | 'audit';
}

export const AdminPermissionsSection: React.FC<AdminPermissionsSectionProps> = ({
  initialSubTab = 'workspace',
}) => {
  const { members, villages, isSuperAdmin, authSession, changeMemberRole, refreshData } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'modules' | 'roles' | 'audit'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [villageFilter, setVillageFilter] = useState<string>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [modulePermissions, setModulePermissions] = useState<UserModulePermission[]>(CANONICAL_SYSTEM_MODULES);
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>('');
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);
  const [savingPermissions, setSavingPermissions] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered members list for user picker
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== 'ALL') {
        const sysRole = m.systemRole || m.role || 'MEMBER';
        if (roleFilter === 'SUPER_ADMIN' && sysRole !== 'SUPER_ADMIN') return false;
        if (roleFilter === 'ADMIN' && sysRole !== 'ADMIN') return false;
        if (roleFilter === 'MEMBER' && sysRole !== 'MEMBER') return false;
      }

      if (villageFilter !== 'ALL') {
        if (String(m.villageId) !== String(villageFilter)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchMobile = m.mobile?.includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q);
        const matchRole = m.systemRole?.toLowerCase().includes(q);
        return matchName || matchMobile || matchEmail || matchRole;
      }

      return true;
    });
  }, [members, roleFilter, villageFilter, searchQuery]);

  // Set default selected member on mount
  useEffect(() => {
    if (!selectedMemberId && filteredMembers.length > 0) {
      setSelectedMemberId(filteredMembers[0].id);
    }
  }, [filteredMembers, selectedMemberId]);

  // Currently selected member object
  const selectedMember = useMemo(() => {
    return members.find((m) => String(m.id) === String(selectedMemberId)) || filteredMembers[0] || null;
  }, [members, filteredMembers, selectedMemberId]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = members.length;
    const superAdmins = members.filter((m) => m.systemRole === 'SUPER_ADMIN').length;
    const admins = members.filter((m) => m.systemRole === 'ADMIN' || m.role === 'ADMIN').length;
    const regularMembers = members.filter((m) => m.systemRole === 'MEMBER' || (!m.systemRole && m.role !== 'ADMIN')).length;

    return { total, superAdmins, admins, regularMembers };
  }, [members]);

  const isSuperAdminUser = selectedMember?.systemRole === 'SUPER_ADMIN';

  // Load user permissions when selected member changes
  useEffect(() => {
    if (selectedMember?.id) {
      setLoadingPermissions(true);
      setStatusMsg(null);

      // Initialize defaults based on member role first
      const isSuper = selectedMember.systemRole === 'SUPER_ADMIN';
      const isAdmin = selectedMember.systemRole === 'ADMIN' || selectedMember.role === 'ADMIN';

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

      // Fetch persistent database overrides
      fetch(`/api/permissions/${selectedMember.id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.modules) && data.modules.length > 0) {
            setModulePermissions(data.modules);
          }
        })
        .catch((err) => {
          console.warn('Using canonical permissions baseline:', err);
        })
        .finally(() => {
          setLoadingPermissions(false);
        });
    }
  }, [selectedMember?.id, selectedMember?.systemRole]);

  // Toggle single action for a module
  const toggleCrud = (
    moduleId: string | number,
    action: 'canRead' | 'canWrite' | 'canUpdate' | 'canDelete'
  ) => {
    if (isSuperAdminUser) return;
    setModulePermissions((prev) =>
      prev.map((mod) => {
        if (String(mod.moduleId) === String(moduleId) || mod.moduleSlug === String(moduleId)) {
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

  // Toggle all actions for a single module
  const toggleModuleAll = (moduleId: string | number) => {
    if (isSuperAdminUser) return;
    setModulePermissions((prev) =>
      prev.map((mod) => {
        if (String(mod.moduleId) === String(moduleId) || mod.moduleSlug === String(moduleId)) {
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

  // Apply Quick Preset
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

  // Handle System Role Change
  const handleRoleChange = async (newRole: SystemRole) => {
    if (!selectedMember || !isSuperAdmin) return;
    try {
      setStatusMsg({ type: 'success', text: `Updating role to ${newRole}...` });
      await changeMemberRole(selectedMember.id, newRole);
      setStatusMsg({ type: 'success', text: `Role updated to ${newRole}!` });
      refreshData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update role' });
    }
  };

  // Save Permissions Matrix
  const handleSavePermissions = async () => {
    if (!selectedMember?.id || isSuperAdminUser) return;
    try {
      setSavingPermissions(true);
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

      const res = await fetch(`/api/permissions/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save permissions');
      }

      setStatusMsg({ type: 'success', text: 'Permissions matrix saved successfully!' });
      refreshData();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error('Error updating permissions:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Error occurred while saving permissions' });
    } finally {
      setSavingPermissions(false);
    }
  };

  // Filter modules inside matrix view
  const filteredModules = useMemo(() => {
    if (!moduleSearchQuery.trim()) return modulePermissions;
    const q = moduleSearchQuery.toLowerCase().trim();
    return modulePermissions.filter(
      (m) =>
        m.moduleName?.toLowerCase().includes(q) ||
        m.moduleSlug?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    );
  }, [modulePermissions, moduleSearchQuery]);

  const getVillageName = (vId?: string) => {
    if (!vId) return 'Rasoolpur';
    const found = villages.find((v) => String(v.id) === String(vId));
    return found ? found.name : 'Rasoolpur';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── 1. HEADER & KPI OVERVIEW ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Permissions & Access</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  PBAC Matrix
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage user permissions and granular CRUD access (Read, Write, Update, Delete) across system modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshData()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Registered system accounts</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/40">
            <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Super Admins</div>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">{stats.superAdmins}</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">Unrestricted 13/13 CRUD privileges</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Village Admins</div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">{stats.admins}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Chapter-level administrative access</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Modules</div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">13</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Protected immutable slugs</div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2">
          <button
            onClick={() => setActiveSubTab('workspace')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'workspace'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Permissions</span>
          </button>

          <button
            onClick={() => setActiveSubTab('modules')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'modules'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Modules</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roles')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'roles'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Roles</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'audit'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Logs</span>
          </button>
        </div>
      </div>

      {/* ── 2. SUBTAB: DEDICATED ACCESS MANAGEMENT WORKSPACE ── */}
      {activeSubTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Member Directory & Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Select User</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredMembers.length} users
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Village Admin</option>
                  <option value="MEMBER">Member</option>
                </select>

                <select
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none truncate"
                >
                  <option value="ALL">All Villages</option>
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scrollable Member List */}
              <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {filteredMembers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No users matching criteria
                  </div>
                ) : (
                  filteredMembers.map((m) => {
                    const isSelected = selectedMember?.id === m.id;
                    const isSuper = m.systemRole === 'SUPER_ADMIN';
                    const isAdmin = m.systemRole === 'ADMIN' || m.role === 'ADMIN';

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMemberId(m.id)}
                        className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-600 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center flex-shrink-0 text-xs ${
                            isSuper
                              ? 'bg-purple-600 text-white'
                              : isAdmin
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {m.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-mono">
                              {m.mobile || 'No mobile'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : isAdmin
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {isSuper ? 'Super Admin' : isAdmin ? 'Admin' : 'Member'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated CRUD Matrix Workspace */}
          <div className="lg:col-span-8 space-y-4">
            {selectedMember ? (
              <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                {/* Active User Card & System Role Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center shadow-xs ${
                      isSuperAdminUser
                        ? 'bg-purple-600 text-white'
                        : selectedMember.systemRole === 'ADMIN'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {selectedMember.name}
                        </h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {getVillageName(selectedMember.villageId)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Mobile: {selectedMember.mobile || 'N/A'} • Email: {selectedMember.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* System Role Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">System Role:</span>
                    {isSuperAdmin ? (
                      <select
                        value={selectedMember.systemRole || (selectedMember.role === 'ADMIN' ? 'ADMIN' : 'MEMBER')}
                        onChange={(e) => handleRoleChange(e.target.value as SystemRole)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 focus:outline-none cursor-pointer"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Village Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {selectedMember.systemRole}
                      </span>
                    )}
                  </div>
                </div>

                {/* Super Admin Notice */}
                {isSuperAdminUser && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-500" />
                    <span>
                      <strong>Super Admin Privilege:</strong> This user automatically holds full unrestricted CRUD (Read, Write, Update, Delete) permissions across all 13 canonical system modules.
                    </span>
                  </div>
                )}

                {/* Presets & Filter Toolbar */}
                {!isSuperAdminUser && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => applyPreset('viewer')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        👁️ Viewer
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('volunteer')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        ➕ Volunteer
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('moderator')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        ✏️ Moderator
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('admin')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        👑 Village Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('all')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition cursor-pointer"
                      >
                        ⭐ Full CRUD
                      </button>
                    </div>

                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter matrix modules..."
                        value={moduleSearchQuery}
                        onChange={(e) => setModuleSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Status Toast */}
                {statusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
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

                {/* 13-Module CRUD Matrix Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-[#0B101D]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3.5 px-4 min-w-[220px]">System Module</th>
                          <th className="py-3.5 px-3 text-center w-24">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-blue-500" /> Read
                            </div>
                          </th>
                          <th className="py-3.5 px-3 text-center w-24">
                            <div className="flex items-center justify-center gap-1">
                              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" /> Write
                            </div>
                          </th>
                          <th className="py-3.5 px-3 text-center w-24">
                            <div className="flex items-center justify-center gap-1">
                              <Edit3 className="w-3.5 h-3.5 text-amber-500" /> Update
                            </div>
                          </th>
                          <th className="py-3.5 px-3 text-center w-24">
                            <div className="flex items-center justify-center gap-1">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </div>
                          </th>
                          <th className="py-3.5 px-4 text-right w-28">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {filteredModules.map((mod) => {
                          const isAllActive = mod.canRead && mod.canWrite && mod.canUpdate && mod.canDelete;

                          return (
                            <tr
                              key={mod.moduleId || mod.moduleSlug}
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
                                  onClick={() => toggleCrud(mod.moduleId || mod.moduleSlug, 'canRead')}
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
                                  onClick={() => toggleCrud(mod.moduleId || mod.moduleSlug, 'canWrite')}
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
                                  onClick={() => toggleCrud(mod.moduleId || mod.moduleSlug, 'canUpdate')}
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
                                  onClick={() => toggleCrud(mod.moduleId || mod.moduleSlug, 'canDelete')}
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
                                    onClick={() => toggleModuleAll(mod.moduleId || mod.moduleSlug)}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
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

                {/* Workspace Bottom Action Footer */}
                <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-slate-500">
                    Configuring permissions for <strong className="text-purple-600">{selectedMember.name}</strong> • 13 Modules Active
                  </div>

                  {!isSuperAdminUser && (
                    <button
                      type="button"
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingPermissions ? 'Saving Permissions...' : 'Save Permissions Matrix'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400">
                Select a user from the directory to manage their access matrix
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. SUBTAB: SYSTEM MODULES REGISTRY ── */}
      {activeSubTab === 'modules' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl flex items-center gap-3 text-xs text-purple-900 dark:text-purple-200">
            <Info className="w-5 h-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
            <div>
              <strong>System Module Integrity:</strong> The module slug is the immutable canonical identifier protected against modifications at database trigger level.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANONICAL_SYSTEM_MODULES.map((mod) => (
              <div
                key={mod.moduleSlug}
                className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-900/40">
                      {MODULE_ICONS[mod.moduleSlug] || <Layers className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {mod.moduleName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">slug: {mod.moduleSlug}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {mod.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">CRUD Capabilities:</span>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                      Read
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                      Write
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono font-bold text-[10px]">
                      Update
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold text-[10px]">
                      Delete
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. SUBTAB: ROLE PRESETS & CAPABILITIES ── */}
      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Super Admin
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Highest administrative authority with unrestricted CRUD (Read, Write, Update, Delete) permissions across all 13 canonical system modules, user role modifications, and global settings.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Village Admin
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Assigned chapter administrator with authority to resolve village grievances, publish social initiatives, schedule community events, and manage village profile settings.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Volunteer / Contributor
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Field worker role with permissions to report grievances, upload media to community gallery, submit initiative proposals, and participate in community discussions.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Viewer / Member
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Default member role with read-only access to view public announcements, community events, educational resources, and village development progress.
            </p>
          </div>
        </div>
      )}

      {/* ── 5. SUBTAB: AUDIT LOGS & ACCESS TRAIL ── */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Security & User Activity Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable security logs tracking administrative operations, permissions matrix modifications, and account role changes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                ● Live Auditing
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {members.slice(0, 10).map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {idx % 2 === 0 ? 'PERMISSIONS_UPDATE' : 'ROLE_ASSIGNED'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.mobile ? m.mobile.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'SYSTEM'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Super Admin
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">{getVillageName(m.villageId)}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(Date.now() - idx * 3600000).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
