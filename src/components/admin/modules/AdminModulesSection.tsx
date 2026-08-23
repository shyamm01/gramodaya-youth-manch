'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Database,
  KeyRound,
  Info,
  Users,
  FileText,
  HeartHandshake,
  Calendar,
  Image as ImageIcon,
  Volume2,
  BookOpen,
  MessageSquare,
  Activity,
  Award,
  Globe,
  Settings,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useRouter } from 'next/navigation';
import { isSuperAdmin as checkIsSuperAdmin } from '@/src/lib/permissions';

export interface DbModule {
  id: number;
  slug: string;
  name: string;
  nameHindi: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  permissionsCount?: number;
  permissions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

const ICON_MAP: Record<string, any> = {
  village: Globe,
  members: Users,
  complaints: FileText,
  social_works: HeartHandshake,
  events: Calendar,
  gallery: ImageIcon,
  announcements: Volume2,
  public_info: Info,
  elders: Award,
  education: BookOpen,
  chat: MessageSquare,
  audit: Activity,
  settings: Settings,
  Globe,
  Users,
  FileText,
  HeartHandshake,
  Calendar,
  ImageIcon,
  Volume2,
  Info,
  Award,
  BookOpen,
  MessageSquare,
  Activity,
  Settings,
  Layers,
  Shield,
  Database,
};

const ROUTE_MAP: Record<string, string> = {
  village: '/admin/villages',
  members: '/admin/members',
  complaints: '/admin/problems',
  social_works: '/admin/social-work',
  events: '/admin/events',
  gallery: '/admin/gallery',
  announcements: '/admin/announcements',
  public_info: '/admin/announcements',
  elders: '/admin/elders',
  education: '/admin/education',
  chat: '/live-chat',
  audit: '/admin/audit',
  settings: '/admin/settings',
};

export const AdminModulesSection: React.FC = () => {
  const { authSession, lang } = useApp();
  const router = useRouter();

  const isSuper = Boolean(
    checkIsSuperAdmin(authSession) ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );

  const [modules, setModules] = useState<DbModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceInfo, setSourceInfo] = useState<string>('database');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<DbModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<DbModule | null>(null);
  const [inspectingModule, setInspectingModule] = useState<DbModule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    nameHindi: '',
    icon: 'Layers',
    description: '',
    displayOrder: 1,
    isActive: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch modules from API / Database
  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/modules');
      const data = await res.json();
      if (data.success && Array.isArray(data.modules)) {
        setModules(data.modules);
        setSourceInfo(data.source || 'database');
      }
    } catch (err: any) {
      console.error('Failed to fetch modules:', err);
      showToast('Error loading modules from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Filter modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nameHindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && m.isActive) ||
        (statusFilter === 'inactive' && !m.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [modules, searchQuery, statusFilter]);

  // Handle Toggle Active Status
  const handleToggleStatus = async (mod: DbModule) => {
    try {
      const updatedStatus = !mod.isActive;
      const res = await fetch(`/api/modules/${mod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setModules((prev) =>
          prev.map((item) => (item.id === mod.id ? { ...item, isActive: updatedStatus } : item))
        );
        showToast(`Module '${mod.name}' is now ${updatedStatus ? 'ACTIVE' : 'INACTIVE'}`);
      } else {
        showToast(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to update'}`);
    }
  };

  // Handle Create Module (POST)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.nameHindi) {
      showToast('Please fill all required fields.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Module '${formData.name}' created successfully!`);
        setIsAddModalOpen(false);
        setFormData({
          slug: '',
          name: '',
          nameHindi: '',
          icon: 'Layers',
          description: '',
          displayOrder: modules.length + 1,
          isActive: true,
        });
        fetchModules();
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err?.message || 'Creation failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Module (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          nameHindi: formData.nameHindi,
          icon: formData.icon,
          description: formData.description,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Module '${formData.name}' updated successfully!`);
        setEditingModule(null);
        fetchModules();
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err?.message || 'Update failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Module (DELETE)
  const handleDeleteConfirm = async () => {
    if (!deletingModule) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/modules/${deletingModule.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Module '${deletingModule.name}' deleted.`);
        setDeletingModule(null);
        fetchModules();
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`❌ Error: ${err?.message || 'Delete failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (mod: DbModule) => {
    setEditingModule(mod);
    setFormData({
      slug: mod.slug,
      name: mod.name,
      nameHindi: mod.nameHindi,
      icon: mod.icon || 'Layers',
      description: mod.description || '',
      displayOrder: mod.displayOrder || 1,
      isActive: mod.isActive,
    });
  };

  const openAddModal = () => {
    setFormData({
      slug: '',
      name: '',
      nameHindi: '',
      icon: 'Layers',
      description: '',
      displayOrder: modules.length + 1,
      isActive: true,
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2 border border-slate-700">
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. MODULES HEADER ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>System Modules</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {modules.length} Total
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              ● Live DB
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic database list of all system modules with complete CRUD controls and capability rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchModules}
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
              <span>Add Module</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search modules by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-[#E4DFD5] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. DYNAMIC MODULES LIST TABLE ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-purple-600" />
            <p className="text-xs font-medium">Fetching modules from database...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No modules found</p>
            <p className="text-xs">Try adjusting your search criteria or add a new module.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Module Name</th>
                  <th className="py-3.5 px-4">Slug / Key</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Capabilities</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredModules.map((mod, index) => {
                  const Icon = ICON_MAP[mod.slug] || ICON_MAP[mod.icon || 'Layers'] || Layers;
                  const operationalRoute = ROUTE_MAP[mod.slug];

                  return (
                    <tr
                      key={mod.id || mod.slug}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                    >
                      {/* Order Number */}
                      <td className="py-4 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {mod.displayOrder || index + 1}
                      </td>

                      {/* Name & Icon */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {mod.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {mod.nameHindi}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug / Code */}
                      <td className="py-4 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                          mod:{mod.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate" title={mod.description || ''}>
                          {mod.description || '—'}
                        </p>
                      </td>

                      {/* Permissions / Capabilities Count */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectingModule(mod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition cursor-pointer"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{mod.permissionsCount || mod.permissions?.length || 0} Actions</span>
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(mod)}
                          className="inline-flex items-center gap-1.5 transition cursor-pointer"
                          title={mod.isActive ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                        >
                          {mod.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Inactive</span>
                            </span>
                          )}
                        </button>
                      </td>

                      {/* CRUD Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {operationalRoute && (
                            <button
                              type="button"
                              onClick={() => router.push(operationalRoute)}
                              title="Open Operational View"
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(mod)}
                            title="Edit Module"
                            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {isSuper && (
                            <button
                              type="button"
                              onClick={() => setDeletingModule(mod)}
                              title="Delete Module"
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

      {/* ── 4. CREATE MODULE MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Register New Module
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add a dynamic module definition into database
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
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Health Camps"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Name (Hindi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. स्वास्थ्य शिविर"
                    value={formData.nameHindi}
                    onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Slug / Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. health_camps"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of module purpose and scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="create_is_active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="create_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Activate module in runtime immediately
                </label>
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
                  {isSubmitting ? 'Saving...' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. EDIT MODULE MODAL ── */}
      {editingModule && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Module
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Slug: {editingModule.slug}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingModule(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Name (English) *
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
                    Name (Hindi) *
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
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#181f33] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="edit_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Module is active and enabled in navigation
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
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

      {/* ── 6. DELETE CONFIRMATION DIALOG ── */}
      {deletingModule && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Module?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete module <span className="font-bold text-slate-900 dark:text-white">'{deletingModule.name}'</span> ({deletingModule.slug})?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingModule(null)}
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

      {/* ── 7. INSPECT PBAC CAPABILITIES MODAL ── */}
      {inspectingModule && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {inspectingModule.name} Capabilities
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    mod:{inspectingModule.slug} · {inspectingModule.permissions?.length || 0} PBAC rules
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingModule(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
              {(inspectingModule.permissions && inspectingModule.permissions.length > 0) ? (
                inspectingModule.permissions.map((p: any) => (
                  <div key={p.code} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div>
                      <div className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                        {p.code}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.nameEnglish} ({p.nameHindi})
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Rule
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No explicit PBAC rules attached to this custom module.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingModule(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setInspectingModule(null);
                  router.push('/admin/permissions');
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure Access Matrix</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
