'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Crown,
  Lock,
  Globe,
  Sliders,
  Users,
  Check,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useRouter } from 'next/navigation';
import { SYSTEM_MODULES, ALL_SYSTEM_PERMISSIONS, isSuperAdmin as checkIsSuperAdmin } from '@/src/lib/permissions';

export interface RoleItem {
  id: string | number;
  code: string;
  name: string;
  nameHindi: string;
  description: string;
  scope: 'GLOBAL' | 'VILLAGE';
  isSystem: boolean;
  permissions: string[];
  permissionsCount: number;
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  SUPER_ADMIN: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Crown,
  },
  ADMIN: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Shield,
  },
  VOLUNTEER: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: Users,
  },
  MEMBER: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: KeyRound,
  },
};

// Global in-memory cache and promise deduplicator
let cachedRoles: RoleItem[] | null = null;
let inFlightRolesPromise: Promise<RoleItem[]> | null = null;

export const clearRolesCache = () => {
  cachedRoles = null;
  inFlightRolesPromise = null;
};

export const AdminRolesSection: React.FC = () => {
  const { authSession, lang, members } = useApp();
  const router = useRouter();

  const isSuper = Boolean(
    checkIsSuperAdmin(authSession) ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );

  const [roles, setRoles] = useState<RoleItem[]>(() => cachedRoles || []);
  const [loading, setLoading] = useState<boolean>(!cachedRoles);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'GLOBAL' | 'VILLAGE'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);
  const [inspectingRole, setInspectingRole] = useState<RoleItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameHindi: '',
    description: '',
    scope: 'VILLAGE' as 'GLOBAL' | 'VILLAGE',
    permissions: [] as string[],
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Roles from Database API with de-duplication & caching
  const fetchRoles = async (forceRefresh = false) => {
    if (!forceRefresh && cachedRoles) {
      setRoles(cachedRoles);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      if (!inFlightRolesPromise || forceRefresh) {
        inFlightRolesPromise = fetch('/api/roles')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.roles)) {
              cachedRoles = data.roles;
              return data.roles;
            }
            return [];
          })
          .finally(() => {
            inFlightRolesPromise = null;
          });
      }

      const result = await inFlightRolesPromise;
      if (result && Array.isArray(result) && result.length > 0) {
        setRoles(result);
      }
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
      showToast('Error loading roles from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Compute members with each role
  const getMemberCountForRole = (roleCode: string) => {
    return members.filter((m) => {
      if (roleCode === 'SUPER_ADMIN') return m.systemRole === 'SUPER_ADMIN' || m.role === 'SUPER_ADMIN';
      if (roleCode === 'ADMIN') return m.systemRole === 'ADMIN' || m.role === 'ADMIN';
      if (roleCode === 'VOLUNTEER') return (m.systemRole as string) === 'VOLUNTEER' || (m.role as any) === 'VOLUNTEER';
      return m.systemRole === 'MEMBER' || m.role === 'MEMBER' || !m.role;
    }).length;
  };

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nameHindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesScope = scopeFilter === 'all' || r.scope === scopeFilter;

      return matchesSearch && matchesScope;
    });
  }, [roles, searchQuery, scopeFilter]);

  // Handle Toggle Permission in Form
  const togglePermissionInForm = (permCode: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permCode);
      const nextPerms = exists
        ? prev.permissions.filter((p) => p !== permCode)
        : [...prev.permissions, permCode];
      return { ...prev, permissions: nextPerms };
    });
  };

  // Handle Select All Permissions for Module in Form
  const toggleModulePermissionsInForm = (moduleSlug: string) => {
    const modPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === moduleSlug).map((p) => p.code as string);
    setFormData((prev) => {
      const hasAll = modPerms.every((p) => prev.permissions.includes(p));
      const nextPerms = hasAll
        ? prev.permissions.filter((p) => !modPerms.includes(p))
        : Array.from(new Set([...prev.permissions, ...modPerms]));
      return { ...prev, permissions: nextPerms };
    });
  };

  // Handle Create Role (POST)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.nameHindi) {
      showToast('Please fill all required fields.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Role '${formData.name}' created successfully!`);
        setIsAddModalOpen(false);

        // Record audit log
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: authSession.currentMember?.name || 'Shyam Varan Pal',
            userRole: authSession.systemRole || authSession.role || 'SUPER_ADMIN',
            userContact: authSession.adminMobile || authSession.currentMember?.mobile || '9506072678',
            action: 'ROLE_CREATED',
            details: `Created new custom role '${formData.name}' (Code: ${formData.code}) with ${formData.permissions.length} capability permissions.`,
            targetEntity: `Role: ${formData.name}`,
          }),
        }).catch(() => {});

        fetchRoles(true);
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err?.message || 'Creation failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Role (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nameHindi: formData.nameHindi,
          description: formData.description,
          scope: formData.scope,
          permissions: formData.permissions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Role '${formData.name}' updated successfully!`);

        // Record audit log
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: authSession.currentMember?.name || 'Shyam Varan Pal',
            userRole: authSession.systemRole || authSession.role || 'SUPER_ADMIN',
            userContact: authSession.adminMobile || authSession.currentMember?.mobile || '9506072678',
            action: 'ROLE_UPDATED',
            details: `Updated permissions and metadata for role '${formData.name}' (${editingRole.code}).`,
            targetEntity: `Role: ${formData.name}`,
          }),
        }).catch(() => {});

        setEditingRole(null);
        fetchRoles(true);
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err?.message || 'Update failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Role (DELETE)
  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/roles/${deletingRole.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Role '${deletingRole.name}' deleted.`);

        // Record audit log
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: authSession.currentMember?.name || 'Shyam Varan Pal',
            userRole: authSession.systemRole || authSession.role || 'SUPER_ADMIN',
            userContact: authSession.adminMobile || authSession.currentMember?.mobile || '9506072678',
            action: 'ROLE_DELETED',
            details: `Deleted custom role '${deletingRole.name}' (${deletingRole.code}).`,
            targetEntity: `Role: ${deletingRole.name}`,
          }),
        }).catch(() => {});

        setDeletingRole(null);
        fetchRoles(true);
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err?.message || 'Delete failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      nameHindi: role.nameHindi,
      description: role.description || '',
      scope: role.scope,
      permissions: role.permissions || [],
    });
  };

  const openAddModal = () => {
    setFormData({
      code: '',
      name: '',
      nameHindi: '',
      description: '',
      scope: 'VILLAGE',
      permissions: [],
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2 border border-slate-700">
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. ROLES HEADER ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-600" />
              <span>System Roles & Authority Profiles</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {roles.length} Roles
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              ● Live DB
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic database list of system authority levels, RBAC scope boundaries, and default module capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchRoles(true)}
            disabled={loading}
            title="Refresh database records"
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isSuper && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Role</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. SEARCH & SCOPE FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles by title, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'GLOBAL', label: 'Global Authority' },
            { id: 'VILLAGE', label: 'Village Scope' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setScopeFilter(sc.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                scopeFilter === sc.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-[#E4DFD5] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. DYNAMIC ROLES LIST TABLE ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-purple-600" />
            <p className="text-xs font-medium">Fetching roles from database...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <KeyRound className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No roles found</p>
            <p className="text-xs">Try adjusting your search criteria or add a custom role preset.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 dark:bg-[#151c2e] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800 select-none">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">#</th>
                  <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Role Profile</th>
                  <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Code / Identifier</th>
                  <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Scope</th>
                  <th className="py-3.5 px-4 min-w-[240px] whitespace-nowrap">Description</th>
                  <th className="py-3.5 px-4 text-center min-w-[130px] whitespace-nowrap">Capabilities</th>
                  <th className="py-3.5 px-4 text-center min-w-[130px] whitespace-nowrap">Assigned Users</th>
                  <th className="py-3.5 px-4 text-right min-w-[100px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredRoles.map((role, index) => {
                  const style = ROLE_COLORS[role.code] || {
                    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
                    text: 'text-indigo-700 dark:text-indigo-300',
                    border: 'border-indigo-200 dark:border-indigo-800',
                    icon: KeyRound,
                  };
                  const Icon = style.icon;
                  const membersCount = getMemberCountForRole(role.code);

                  return (
                    <tr
                      key={role.id || role.code}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                    >
                      {/* Order */}
                      <td className="py-4 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Name & Icon */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center ${style.text} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                              <span>{role.name}</span>
                              {role.isSystem && (
                                <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[9px] font-bold">
                                  CORE
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {role.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-4 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded-md ${style.bg} ${style.text} border ${style.border} text-[11px] font-bold`}>
                          {role.code}
                        </span>
                      </td>

                      {/* Scope */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {role.scope}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate" title={role.description}>
                          {role.description || '—'}
                        </p>
                      </td>

                      {/* Capabilities Count */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectingRole(role)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition cursor-pointer"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{role.permissionsCount || role.permissions?.length || 0} Actions</span>
                        </button>
                      </td>

                      {/* Active Members */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                          {membersCount} users
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            title="Edit Role Details & Permissions"
                            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {!role.isSystem && isSuper && (
                            <button
                              type="button"
                              onClick={() => setDeletingRole(role)}
                              title="Delete Custom Role"
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. CREATE ROLE MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create Custom Role
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define a custom authority preset and assign granular module permissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Role Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Health Officer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Role Name (Hindi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. स्वास्थ्य अधिकारी"
                    value={formData.nameHindi}
                    onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Role Code / Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HEALTH_OFFICER"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Scope Authority
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="VILLAGE">Village Scope (Chapter specific)</option>
                    <option value="GLOBAL">Global Authority (All villages)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline responsibilities and operational authority for this role..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Granular Permissions Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Assign Module Capabilities ({formData.permissions.length} Selected)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const allCodes = ALL_SYSTEM_PERMISSIONS.map((p) => p.code);
                      setFormData((prev) => ({
                        ...prev,
                        permissions: prev.permissions.length === allCodes.length ? [] : allCodes,
                      }));
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                  >
                    {formData.permissions.length === ALL_SYSTEM_PERMISSIONS.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
                  {SYSTEM_MODULES.map((mod) => {
                    const modPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === mod.id);
                    const selectedCount = modPerms.filter((p) => formData.permissions.includes(p.code)).length;

                    return (
                      <div key={mod.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {mod.nameEnglish} ({mod.nameHindi})
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModulePermissionsInForm(mod.id)}
                            className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            {selectedCount === modPerms.length ? 'Deselect Module' : 'Select All Module'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {modPerms.map((p) => {
                            const isChecked = formData.permissions.includes(p.code);
                            return (
                              <label
                                key={p.code}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-[11px] transition cursor-pointer ${
                                  isChecked ? 'bg-purple-100/70 dark:bg-purple-950/70 font-bold text-purple-900 dark:text-purple-200' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermissionInForm(p.code)}
                                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-mono text-[10px]">{p.code.split(':')[1] || p.code}</span>
                                <span className="text-[10px] text-slate-400 truncate">({p.name})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. EDIT ROLE MODAL ── */}
      {editingRole && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Role: {editingRole.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Code: {editingRole.code} {editingRole.isSystem && '· (System Core Role)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Role Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Role Name (Hindi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameHindi}
                    onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Scope Authority
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="VILLAGE">Village Scope (Chapter specific)</option>
                  <option value="GLOBAL">Global Authority (All villages)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Granular Permissions Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Module Capabilities ({formData.permissions.length} Selected)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const allCodes = ALL_SYSTEM_PERMISSIONS.map((p) => p.code);
                      setFormData((prev) => ({
                        ...prev,
                        permissions: prev.permissions.length === allCodes.length ? [] : allCodes,
                      }));
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                  >
                    {formData.permissions.length === ALL_SYSTEM_PERMISSIONS.length ? 'Clear All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
                  {SYSTEM_MODULES.map((mod) => {
                    const modPerms = ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === mod.id);
                    const selectedCount = modPerms.filter((p) => formData.permissions.includes(p.code)).length;

                    return (
                      <div key={mod.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {mod.nameEnglish} ({mod.nameHindi})
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleModulePermissionsInForm(mod.id)}
                            className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            {selectedCount === modPerms.length ? 'Deselect Module' : 'Select All Module'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {modPerms.map((p) => {
                            const isChecked = formData.permissions.includes(p.code);
                            return (
                              <label
                                key={p.code}
                                className={`flex items-center gap-2 p-1.5 rounded-lg text-[11px] transition cursor-pointer ${
                                  isChecked ? 'bg-purple-100/70 dark:bg-purple-950/70 font-bold text-purple-900 dark:text-purple-200' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermissionInForm(p.code)}
                                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-mono text-[10px]">{p.code.split(':')[1] || p.code}</span>
                                <span className="text-[10px] text-slate-400 truncate">({p.name})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. DELETE ROLE MODAL ── */}
      {deletingRole && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Role Preset?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete custom role <span className="font-bold text-slate-900 dark:text-white">'{deletingRole.name}'</span> ({deletingRole.code})?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. INSPECT ROLE PERMISSIONS MODAL ── */}
      {inspectingRole && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {inspectingRole.name} Capabilities
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {inspectingRole.code} · {inspectingRole.permissions?.length || 0} Actions Granted
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingRole(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {SYSTEM_MODULES.map((mod) => {
                  const modPerms = ALL_SYSTEM_PERMISSIONS.filter(
                    (p) => p.module === mod.id && inspectingRole.permissions?.includes(p.code)
                  );

                  if (modPerms.length === 0) return null;

                  return (
                    <div key={mod.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-700 dark:text-purple-300">
                          {mod.nameEnglish}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {modPerms.length} permissions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {modPerms.map((p) => (
                          <span
                            key={p.code}
                            className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[10px] font-mono text-purple-800 dark:text-purple-200"
                          >
                            {p.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingRole(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const r = inspectingRole;
                  setInspectingRole(null);
                  openEditModal(r);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Permissions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
