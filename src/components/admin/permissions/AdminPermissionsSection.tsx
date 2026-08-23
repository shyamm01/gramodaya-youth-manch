'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  Search,
  Check,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Eye,
  Edit3,
  Trash2,
  Building2,
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
  ExternalLink,
  Crown,
  Filter,
} from 'lucide-react';
import { Member, SystemRole, UserModulePermission } from '@/src/types';
import { useApp } from '@/src/context/AppContext';
import { useRouter } from 'next/navigation';
import {
  SYSTEM_MODULES,
  ALL_SYSTEM_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  isSuperAdmin as checkIsSuperAdmin,
} from '@/src/lib/permissions';

const MODULE_ICONS: Record<string, any> = {
  village: Building2,
  members: Users,
  complaints: AlertCircle,
  social_works: HeartHandshake,
  events: Calendar,
  gallery: ImageIcon,
  announcements: Megaphone,
  public_info: FileText,
  elders: UserCheck,
  education: GraduationCap,
  chat: MessageSquare,
  audit: Activity,
  settings: Settings,
};

const CANONICAL_SYSTEM_MODULES: UserModulePermission[] = SYSTEM_MODULES.map((m, idx) => ({
  moduleId: String(idx + 1),
  moduleSlug: m.id,
  moduleName: m.nameEnglish,
  moduleNameHindi: m.nameHindi,
  description: m.description,
  canRead: true,
  canWrite: false,
  canUpdate: false,
  canDelete: false,
}));

export interface AdminPermissionsSectionProps {
  initialSubTab?: 'user-matrix' | 'capabilities-catalog' | 'role-matrix' | 'workspace' | 'modules' | 'roles' | 'audit';
}

export const AdminPermissionsSection: React.FC<AdminPermissionsSectionProps> = ({
  initialSubTab = 'user-matrix',
}) => {
  const { members, villages, authSession, changeMemberRole, refreshData } = useApp();
  const router = useRouter();

  const isSuper = Boolean(
    checkIsSuperAdmin(authSession) ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );

  // Normalize subTab
  const normalizedInitialTab =
    initialSubTab === 'capabilities-catalog'
      ? 'capabilities-catalog'
      : initialSubTab === 'role-matrix'
      ? 'role-matrix'
      : 'user-matrix';

  const [activeTab, setActiveTab] = useState<'user-matrix' | 'capabilities-catalog' | 'role-matrix'>(
    normalizedInitialTab
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [villageFilter, setVillageFilter] = useState<string>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [modulePermissions, setModulePermissions] = useState<UserModulePermission[]>(CANONICAL_SYSTEM_MODULES);
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>('');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [catalogModuleFilter, setCatalogModuleFilter] = useState<string>('ALL');
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

  // Load user permissions when selected member changes
  useEffect(() => {
    if (selectedMember?.id) {
      setLoadingPermissions(true);
      setStatusMsg(null);

      const isUserSuper = selectedMember.systemRole === 'SUPER_ADMIN' || selectedMember.role === 'SUPER_ADMIN';
      const isUserAdmin = selectedMember.systemRole === 'ADMIN' || selectedMember.role === 'ADMIN';

      const initial = CANONICAL_SYSTEM_MODULES.map((mod) => {
        if (isUserSuper) {
          return { ...mod, canRead: true, canWrite: true, canUpdate: true, canDelete: true };
        }
        if (isUserAdmin) {
          const isCore = mod.moduleSlug === 'audit' || mod.moduleSlug === 'settings';
          return { ...mod, canRead: true, canWrite: !isCore, canUpdate: !isCore, canDelete: !isCore };
        }
        const canWrite = ['complaints', 'gallery', 'chat'].includes(mod.moduleSlug);
        return { ...mod, canRead: true, canWrite, canUpdate: false, canDelete: false };
      });
      setModulePermissions(initial);

      // Fetch persistent database overrides if available
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
    if (selectedMember?.systemRole === 'SUPER_ADMIN') return;
    setModulePermissions((prev) =>
      prev.map((mod) => {
        if (String(mod.moduleId) === String(moduleId) || mod.moduleSlug === String(moduleId)) {
          return {
            ...mod,
            [action]: !mod[action],
          };
        }
        return mod;
      })
    );
  };

  // Toggle all actions for a single module
  const toggleModuleAll = (moduleId: string | number) => {
    if (selectedMember?.systemRole === 'SUPER_ADMIN') return;
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
          };
        }
        return mod;
      })
    );
  };

  // Apply Quick Role Preset
  const applyRolePreset = (preset: 'super' | 'admin' | 'volunteer' | 'member' | 'readonly') => {
    setModulePermissions((prev) =>
      prev.map((mod) => {
        const slug = mod.moduleSlug;
        if (preset === 'super') {
          return { ...mod, canRead: true, canWrite: true, canUpdate: true, canDelete: true };
        }
        if (preset === 'admin') {
          const isCore = slug === 'audit' || slug === 'settings';
          return {
            ...mod,
            canRead: true,
            canWrite: !isCore,
            canUpdate: !isCore,
            canDelete: !isCore,
          };
        }
        if (preset === 'volunteer') {
          const canWrite = ['complaints', 'social_works', 'gallery', 'chat'].includes(slug);
          return { ...mod, canRead: true, canWrite, canUpdate: false, canDelete: false };
        }
        if (preset === 'member') {
          const canWrite = ['complaints', 'chat'].includes(slug);
          return { ...mod, canRead: true, canWrite, canUpdate: false, canDelete: false };
        }
        return { ...mod, canRead: true, canWrite: false, canUpdate: false, canDelete: false };
      })
    );
  };

  // Handle System Role Change
  const handleRoleChange = async (newRole: SystemRole) => {
    if (!selectedMember || !isSuper) return;
    try {
      setStatusMsg({ type: 'success', text: `Updating role to ${newRole}...` });
      await changeMemberRole(selectedMember.id, newRole);
      setStatusMsg({ type: 'success', text: `Role updated to ${newRole}!` });
      refreshData();

      // Record audit log
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: authSession.currentMember?.name || 'Shyam Varan Pal',
          userRole: authSession.systemRole || authSession.role || 'SUPER_ADMIN',
          userContact: authSession.adminMobile || authSession.currentMember?.mobile || '9506072678',
          action: 'ROLE_ASSIGNMENT',
          details: `Changed authority role of member ${selectedMember.name} to ${newRole}.`,
          targetEntity: `Member: ${selectedMember.name}`,
          targetUser: selectedMember.name,
        }),
      }).catch(() => {});
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to update role' });
    }
  };

  // Save Permissions Matrix
  const handleSavePermissions = async () => {
    if (!selectedMember?.id || selectedMember?.systemRole === 'SUPER_ADMIN') return;
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

      // Record audit log
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: authSession.currentMember?.name || 'Shyam Varan Pal',
          userRole: authSession.systemRole || authSession.role || 'SUPER_ADMIN',
          userContact: authSession.adminMobile || authSession.currentMember?.mobile || '9506072678',
          action: 'POLICY_PERMISSIONS_UPDATE',
          details: `Updated custom PBAC module capability matrix for member ${selectedMember.name} across ${modulePermissions.length} modules.`,
          targetEntity: `Member: ${selectedMember.name}`,
          targetUser: selectedMember.name,
        }),
      }).catch(() => {});

      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      console.error('Error updating permissions:', err);
      setStatusMsg({ type: 'error', text: err?.message || 'Error occurred while saving permissions' });
    } finally {
      setSavingPermissions(false);
    }
  };

  // Filter modules inside matrix view
  const filteredMatrixModules = useMemo(() => {
    if (!moduleSearchQuery.trim()) return modulePermissions;
    const q = moduleSearchQuery.toLowerCase().trim();
    return modulePermissions.filter(
      (m) =>
        m.moduleName?.toLowerCase().includes(q) ||
        m.moduleSlug?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    );
  }, [modulePermissions, moduleSearchQuery]);

  // Filter catalog permissions
  const filteredCatalogPermissions = useMemo(() => {
    return ALL_SYSTEM_PERMISSIONS.filter((p) => {
      const matchesSearch =
        p.code.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        p.module.toLowerCase().includes(catalogSearchQuery.toLowerCase());

      const matchesModule = catalogModuleFilter === 'ALL' || p.module === catalogModuleFilter;

      return matchesSearch && matchesModule;
    });
  }, [catalogSearchQuery, catalogModuleFilter]);

  const getVillageName = (vId?: string) => {
    if (!vId) return 'Rasoolpur';
    const found = villages.find((v) => String(v.id) === String(vId));
    return found ? found.name : 'Rasoolpur';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {statusMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2 border ${
            statusMsg.type === 'success'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-emerald-500'
              : 'bg-rose-900 text-white border-rose-500'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ── 1. HEADER & KPI OVERVIEW ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Policy-Based Access Control
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  PBAC Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect 52 system capabilities, evaluate role defaults, and configure per-user CRUD policy overrides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/modules')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Manage Modules</span>
            </button>
            <button
              onClick={() => router.push('/admin/roles')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Manage Roles</span>
            </button>
          </div>
        </div>

        {/* 4 Relevant Info KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Capabilities</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {ALL_SYSTEM_PERMISSIONS.length} Actions
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Granular PBAC action codes</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/40">
            <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Governed Modules</div>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">
              {SYSTEM_MODULES.length} Units
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">Canonical functional domains</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Authority Presets</div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">4 Presets</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Super Admin, Admin, Volunteer, Member</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Managed Accounts</div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {members.length} Users
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Registered profile accounts</div>
          </div>
        </div>

        {/* 3 Focused Relevant Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('user-matrix')}
            className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'user-matrix'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>User Policy Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('capabilities-catalog')}
            className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'capabilities-catalog'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>System Capabilities Catalog ({ALL_SYSTEM_PERMISSIONS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('role-matrix')}
            className={`pb-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'role-matrix'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Role Defaults Comparison</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: USER POLICY MATRIX ── */}
      {activeTab === 'user-matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: User Picker */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Select Member / User</span>
              </h2>
              <p className="text-[11px] text-slate-400">Choose a user to configure customized permissions</p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Village Admin</option>
                  <option value="MEMBER">Member</option>
                </select>

                <select
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Villages</option>
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Members List */}
            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No users match your filters.</div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = String(m.id) === String(selectedMember?.id);
                  const isSuperM = m.systemRole === 'SUPER_ADMIN';
                  const isAdminM = m.systemRole === 'ADMIN' || m.role === 'ADMIN';

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`w-full text-left p-3 rounded-2xl transition border flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs flex-shrink-0">
                          {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {m.mobile || m.email || 'No contact'}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                            isSuperM
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : isAdminM
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m.systemRole || m.role || 'MEMBER'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Permission Matrix for Selected User */}
          <div className="lg:col-span-8 space-y-6">
            {selectedMember ? (
              <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-6">
                {/* User Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-lg">
                      {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedMember.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {selectedMember.systemRole || selectedMember.role || 'MEMBER'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{selectedMember.mobile}</span>
                        <span>·</span>
                        <span>{getVillageName(selectedMember.villageId)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Save */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSavePermissions}
                      disabled={savingPermissions || selectedMember.systemRole === 'SUPER_ADMIN'}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingPermissions ? 'Saving...' : 'Save Matrix'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Quick Policy Templates:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'super', label: 'Super Admin (Full CRUD)' },
                      { id: 'admin', label: 'Village Admin' },
                      { id: 'volunteer', label: 'Volunteer' },
                      { id: 'member', label: 'Member' },
                      { id: 'readonly', label: 'Read-Only' },
                    ].map((ps) => (
                      <button
                        key={ps.id}
                        type="button"
                        onClick={() => applyRolePreset(ps.id as any)}
                        disabled={selectedMember.systemRole === 'SUPER_ADMIN'}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 transition cursor-pointer disabled:opacity-40"
                      >
                        {ps.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search in Modules */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search modules in permissions table..."
                    value={moduleSearchQuery}
                    onChange={(e) => setModuleSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Modules Permissions Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Module Domain</th>
                          <th className="py-3 px-3 text-center">Read</th>
                          <th className="py-3 px-3 text-center">Write</th>
                          <th className="py-3 px-3 text-center">Update</th>
                          <th className="py-3 px-3 text-center">Delete</th>
                          <th className="py-3 px-3 text-center">All</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {filteredMatrixModules.map((mod) => {
                          const Icon = MODULE_ICONS[mod.moduleSlug] || Layers;
                          const isAllActive = mod.canRead && mod.canWrite && mod.canUpdate && mod.canDelete;

                          return (
                            <tr key={mod.moduleId || mod.moduleSlug} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                      {mod.moduleName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      mod:{mod.moduleSlug}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Read */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleCrud(mod.moduleId, 'canRead')}
                                  className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition cursor-pointer ${
                                    mod.canRead
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                  }`}
                                >
                                  {mod.canRead && <Check className="w-3.5 h-3.5" />}
                                </button>
                              </td>

                              {/* Write */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleCrud(mod.moduleId, 'canWrite')}
                                  className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition cursor-pointer ${
                                    mod.canWrite
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                  }`}
                                >
                                  {mod.canWrite && <Check className="w-3.5 h-3.5" />}
                                </button>
                              </td>

                              {/* Update */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleCrud(mod.moduleId, 'canUpdate')}
                                  className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition cursor-pointer ${
                                    mod.canUpdate
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                  }`}
                                >
                                  {mod.canUpdate && <Check className="w-3.5 h-3.5" />}
                                </button>
                              </td>

                              {/* Delete */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleCrud(mod.moduleId, 'canDelete')}
                                  className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition cursor-pointer ${
                                    mod.canDelete
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                  }`}
                                >
                                  {mod.canDelete && <Check className="w-3.5 h-3.5" />}
                                </button>
                              </td>

                              {/* All Toggle */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleModuleAll(mod.moduleId)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                    isAllActive
                                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {isAllActive ? 'ALL' : 'CUSTOM'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400">
                Select a user from the directory on the left to configure access permissions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SYSTEM CAPABILITIES CATALOG (ALL 52 ACTIONS) ── */}
      {activeTab === 'capabilities-catalog' && (
        <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <span>System Capabilities Catalog</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete directory of all 52 granular PBAC action codes enforced in backend policies
              </p>
            </div>

            {/* Search & Module Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={catalogModuleFilter}
                onChange={(e) => setCatalogModuleFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Modules ({SYSTEM_MODULES.length})</option>
                {SYSTEM_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCatalogPermissions.map((perm) => {
              const Icon = MODULE_ICONS[perm.module] || Layers;

              return (
                <div
                  key={perm.code}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800/80 transition space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono font-bold text-[11px] text-purple-700 dark:text-purple-300">
                        {perm.code}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {perm.module}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {perm.name}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {perm.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: ROLE DEFAULTS COMPARISON MATRIX ── */}
      {activeTab === 'role-matrix' && (
        <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Default Role Authority Comparison</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-level comparative matrix of default permissions assigned to each system role
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">System Module</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                    <th className="py-3 px-3 text-center">Village Admin</th>
                    <th className="py-3 px-3 text-center">Volunteer</th>
                    <th className="py-3 px-3 text-center">Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {SYSTEM_MODULES.map((mod) => {
                    const Icon = MODULE_ICONS[mod.id] || Layers;
                    const isSuperFull = true;
                    const isAdminAllowed = !['audit', 'settings'].includes(mod.id);
                    const isVolunteerAllowed = ['complaints', 'social_works', 'events', 'gallery', 'announcements', 'education', 'chat'].includes(mod.id);
                    const isMemberAllowed = ['complaints', 'gallery', 'chat'].includes(mod.id);

                    return (
                      <tr key={mod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs">
                                {mod.nameEnglish}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                mod:{mod.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Super Admin */}
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            <Check className="w-3 h-3 text-purple-500" />
                            <span>Full CRUD</span>
                          </span>
                        </td>

                        {/* Village Admin */}
                        <td className="py-3 px-3 text-center">
                          {isAdminAllowed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              <Check className="w-3 h-3 text-blue-500" />
                              <span>Manage</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Locked</span>
                          )}
                        </td>

                        {/* Volunteer */}
                        <td className="py-3 px-3 text-center">
                          {isVolunteerAllowed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Contribute</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Read Only</span>
                          )}
                        </td>

                        {/* Member */}
                        <td className="py-3 px-3 text-center">
                          {isMemberAllowed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              <Check className="w-3 h-3 text-slate-500" />
                              <span>Participate</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Read Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
