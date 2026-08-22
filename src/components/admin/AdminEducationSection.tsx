'use client';

/**
 * Super Admin → Education.
 *
 * Full CRUD over the education module: categories, the schemes/resources inside
 * them (with their apply-here links), and the citizen enquiries that come in
 * from the education pages. Talks to /api/education/* directly rather than
 * going through AppContext, so the module stays self-contained — a new field on
 * the API only has to be added to the form here.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/src/context/AppContext';
import {
  GraduationCap,
  Layers,
  BookOpen,
  Inbox,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Link2,
  X,
  Send,
  CheckCircle,
  Globe,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '@/src/lib/apiClient';
import { Dialog } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type {
  EducationCategory,
  EducationEnquiry,
  EducationEnquiryStatus,
  EducationResource,
  EducationResourceLink,
  EducationStatus,
} from '@/src/types';

type SectionView = 'categories' | 'resources' | 'enquiries';

const CONTENT_STATUSES: EducationStatus[] = ['draft', 'pending', 'published', 'archived'];
const ENQUIRY_STATUSES: EducationEnquiryStatus[] = ['new', 'in_progress', 'resolved', 'closed'];
const RESOURCE_TYPES = [
  'scheme',
  'scholarship',
  'course',
  'institution',
  'guidance',
  'resource',
  'other',
] as const;
const LINK_TYPES = ['portal', 'pdf', 'video', 'form', 'contact', 'other'] as const;

const inputClass =
  'w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition';
const labelClass =
  'block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5';
const cardClass =
  'bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl shadow-xs';

const shimmerClass = 'bg-slate-100 dark:bg-[#1c1c20] rounded-lg animate-pulse';

/**
 * Placeholder that matches the shape of whichever view is loading, so the
 * layout does not jump once the real rows arrive: cards for categories and
 * enquiries, a table for resources.
 */
const SectionSkeleton: React.FC<{ view: SectionView }> = ({ view }) => {
  if (view === 'resources') {
    return (
      <div className={`${cardClass} overflow-hidden`}>
        <div className="bg-slate-50 dark:bg-[#18181c] px-4 py-3 flex items-center gap-4">
          {['w-24', 'w-20', 'w-16', 'w-14'].map((w) => (
            <div key={w} className={`${shimmerClass} h-2.5 ${w}`} />
          ))}
        </div>
        <div className="divide-y divide-slate-100 dark:divide-[#1e1f24]">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="px-4 py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className={`${shimmerClass} h-3 w-2/5`} />
                <div className={`${shimmerClass} h-2.5 w-3/5`} />
              </div>
              <div className={`${shimmerClass} h-2.5 w-20 hidden sm:block`} />
              <div className={`${shimmerClass} h-5 w-20 rounded-full`} />
              <div className={`${shimmerClass} h-7 w-24 rounded-xl`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((card) => (
        <div key={card} className={`${cardClass} p-5 space-y-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className={`${shimmerClass} h-3.5 w-1/2`} />
              <div className={`${shimmerClass} h-2.5 w-2/3`} />
            </div>
            <div className={`${shimmerClass} h-5 w-16 rounded-full shrink-0`} />
          </div>
          <div className="space-y-1.5">
            <div className={`${shimmerClass} h-2.5 w-full`} />
            <div className={`${shimmerClass} h-2.5 w-4/5`} />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between">
            <div className={`${shimmerClass} h-2.5 w-24`} />
            <div className={`${shimmerClass} h-4 w-4 rounded`} />
          </div>
        </div>
      ))}
    </div>
  );
};

const statusVariant = (status: string) => {
  if (status === 'published' || status === 'resolved') return 'success' as const;
  if (status === 'pending' || status === 'in_progress') return 'warning' as const;
  if (status === 'archived' || status === 'closed') return 'secondary' as const;
  if (status === 'new') return 'emerald' as const;
  return 'outline' as const;
};

/** "a, b, c" ⇄ ['a','b','c'] for the list-style fields. */
const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

interface CategoryFormState {
  id?: string;
  name: string;
  nameHindi: string;
  slug: string;
  overview: string;
  overviewHindi: string;
  icon: string;
  displayOrder: string;
  status: EducationStatus;
  villageScoped: boolean;
}

interface ResourceFormState {
  id?: string;
  categoryId: string;
  title: string;
  titleHindi: string;
  slug: string;
  description: string;
  descriptionHindi: string;
  icon: string;
  scope: 'gramodaya' | 'government';
  type: string;
  status: EducationStatus;
  provider: string;
  externalUrl: string;
  eligibility: string;
  benefits: string;
  howToApply: string;
  documentsRequired: string;
  eligibilityHindi: string;
  benefitsHindi: string;
  howToApplyHindi: string;
  documentsRequiredHindi: string;
  providerHindi: string;
  tags: string;
  contactName: string;
  contactMobile: string;
  ctaLabel: string;
  ctaLabelHindi: string;
  startDate: string;
  endDate: string;
  displayOrder: string;
  villageScoped: boolean;
  links: Array<Pick<EducationResourceLink, 'label' | 'url' | 'type'>>;
}

const emptyCategoryForm = (): CategoryFormState => ({
  name: '',
  nameHindi: '',
  slug: '',
  overview: '',
  overviewHindi: '',
  icon: 'GraduationCap',
  displayOrder: '0',
  status: 'published',
  villageScoped: false,
});

const emptyResourceForm = (categoryId = ''): ResourceFormState => ({
  categoryId,
  title: '',
  titleHindi: '',
  slug: '',
  description: '',
  descriptionHindi: '',
  icon: 'BookOpen',
  scope: 'government',
  type: 'scheme',
  status: 'published',
  provider: '',
  externalUrl: '',
  eligibility: '',
  benefits: '',
  howToApply: '',
  documentsRequired: '',
  eligibilityHindi: '',
  benefitsHindi: '',
  howToApplyHindi: '',
  documentsRequiredHindi: '',
  providerHindi: '',
  tags: '',
  contactName: '',
  contactMobile: '',
  ctaLabel: '',
  ctaLabelHindi: '',
  startDate: '',
  endDate: '',
  displayOrder: '0',
  villageScoped: false,
  links: [],
});

export const AdminEducationSection: React.FC = () => {
  const { activeVillageId } = useApp();

  const [view, setView] = useState<SectionView>('categories');
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [enquiries, setEnquiries] = useState<EducationEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EducationStatus>('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'gramodaya' | 'government'>('ALL');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'ALL' | EducationEnquiryStatus>('ALL');

  // Editors
  const [categoryForm, setCategoryForm] = useState<CategoryFormState | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourceFormState | null>(null);
  const [activeEnquiry, setActiveEnquiry] = useState<EducationEnquiry | null>(null);
  const [enquiryReply, setEnquiryReply] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<
    | { kind: 'category'; id: string; label: string; childCount: number }
    | { kind: 'resource'; id: string; label: string }
    | { kind: 'enquiry'; id: string; label: string }
    | null
  >(null);

  const flash = useCallback((type: 'ok' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  }, []);

  // ── LOADING ────────────────────────────────────────────────────────────────
  // status=all is what makes drafts visible; the API only honors it for callers
  // holding education:view / education:manage.
  const loadAll = useCallback(async () => {
    setLoading(true);
    const villageQuery = activeVillageId ? `&villageId=${activeVillageId}` : '';
    try {
      const [catRes, resRes, enqRes] = await Promise.all([
        apiClient.get(`/api/education/categories?status=all${villageQuery}`),
        apiClient.get(`/api/education/resources?status=all${villageQuery}`),
        apiClient.get(`/api/education/enquiries?status=all${villageQuery}`).catch(() => ({ enquiries: [] })),
      ]);
      setCategories(catRes?.categories || []);
      setResources(resRes?.resources || []);
      setEnquiries(enqRes?.enquiries || []);
    } catch (err: any) {
      flash('error', err?.message || 'Failed to load education data');
    } finally {
      setLoading(false);
    }
  }, [activeVillageId, flash]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const categoryName = useCallback(
    (id?: string) => categories.find((c) => c.id === id)?.name || '—',
    [categories]
  );

  const resourceCountFor = useCallback(
    (categoryId: string) => resources.filter((r) => r.categoryId === categoryId).length,
    [resources]
  );

  const filteredResources = useMemo(() => {
    const term = search.trim().toLowerCase();
    return resources.filter((r) => {
      if (categoryFilter !== 'ALL' && r.categoryId !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (scopeFilter !== 'ALL' && r.scope !== scopeFilter) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        (r.titleHindi || '').toLowerCase().includes(term) ||
        (r.description || '').toLowerCase().includes(term)
      );
    });
  }, [resources, search, categoryFilter, statusFilter, scopeFilter]);

  const filteredEnquiries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (enquiryStatusFilter !== 'ALL' && e.status !== enquiryStatusFilter) return false;
      if (!term) return true;
      return (
        e.name.toLowerCase().includes(term) ||
        e.mobile.includes(term) ||
        e.message.toLowerCase().includes(term)
      );
    });
  }, [enquiries, search, enquiryStatusFilter]);

  // ── CATEGORY CRUD ──────────────────────────────────────────────────────────
  const openCategoryEditor = (category?: EducationCategory) => {
    if (!category) {
      setCategoryForm(emptyCategoryForm());
      return;
    }
    setCategoryForm({
      id: category.id,
      name: category.name,
      nameHindi: category.nameHindi || '',
      slug: category.slug,
      overview: category.overview || '',
      overviewHindi: category.overviewHindi || '',
      icon: category.icon || 'GraduationCap',
      displayOrder: String(category.displayOrder ?? 0),
      status: category.status,
      villageScoped: Boolean(category.villageId),
    });
  };

  const saveCategory = async () => {
    if (!categoryForm) return;
    if (!categoryForm.name.trim()) {
      flash('error', 'Category name is required');
      return;
    }

    const payload: Record<string, any> = {
      name: categoryForm.name.trim(),
      nameHindi: categoryForm.nameHindi.trim() || undefined,
      overview: categoryForm.overview.trim() || undefined,
      overviewHindi: categoryForm.overviewHindi.trim() || undefined,
      icon: categoryForm.icon.trim() || 'GraduationCap',
      displayOrder: Number(categoryForm.displayOrder) || 0,
      status: categoryForm.status,
      villageId: categoryForm.villageScoped ? activeVillageId : null,
    };
    if (categoryForm.slug.trim()) payload.slug = categoryForm.slug.trim().toLowerCase();

    setBusy(true);
    try {
      if (categoryForm.id) {
        await apiClient.patch(`/api/education/categories/${categoryForm.id}`, payload);
      } else {
        await apiClient.post('/api/education/categories', payload);
      }
      setCategoryForm(null);
      await loadAll();
      flash('ok', categoryForm.id ? 'Category updated' : 'Category created');
    } catch (err: any) {
      flash('error', err?.message || 'Failed to save category');
    } finally {
      setBusy(false);
    }
  };

  // ── RESOURCE CRUD ──────────────────────────────────────────────────────────
  const openResourceEditor = (resource?: EducationResource) => {
    if (!resource) {
      setResourceForm(emptyResourceForm(categoryFilter !== 'ALL' ? categoryFilter : categories[0]?.id || ''));
      return;
    }
    setResourceForm({
      id: resource.id,
      categoryId: resource.categoryId,
      title: resource.title,
      titleHindi: resource.titleHindi || '',
      slug: resource.slug,
      description: resource.description || '',
      descriptionHindi: resource.descriptionHindi || '',
      icon: resource.icon || 'BookOpen',
      scope: resource.scope,
      type: resource.type,
      status: resource.status,
      provider: resource.provider || '',
      externalUrl: resource.externalUrl || '',
      eligibility: resource.eligibility || '',
      benefits: resource.benefits || '',
      howToApply: resource.howToApply || '',
      documentsRequired: (resource.documentsRequired || []).join(', '),
      eligibilityHindi: resource.eligibilityHindi || '',
      benefitsHindi: resource.benefitsHindi || '',
      howToApplyHindi: resource.howToApplyHindi || '',
      documentsRequiredHindi: (resource.documentsRequiredHindi || []).join(', '),
      providerHindi: resource.providerHindi || '',
      tags: (resource.tags || []).join(', '),
      contactName: resource.contactName || '',
      contactMobile: resource.contactMobile || '',
      ctaLabel: resource.ctaLabel || '',
      ctaLabelHindi: resource.ctaLabelHindi || '',
      startDate: resource.startDate || '',
      endDate: resource.endDate || '',
      displayOrder: String(resource.displayOrder ?? 0),
      villageScoped: Boolean(resource.villageId),
      links: (resource.links || []).map((l) => ({ label: l.label, url: l.url, type: l.type })),
    });
  };

  const saveResource = async () => {
    if (!resourceForm) return;
    if (!resourceForm.categoryId) {
      flash('error', 'Pick a category for this scheme');
      return;
    }
    if (!resourceForm.title.trim()) {
      flash('error', 'Title is required');
      return;
    }

    const links = resourceForm.links.filter((l) => l.label.trim() && l.url.trim());
    const payload: Record<string, any> = {
      categoryId: resourceForm.categoryId,
      title: resourceForm.title.trim(),
      titleHindi: resourceForm.titleHindi.trim() || undefined,
      description: resourceForm.description.trim() || undefined,
      descriptionHindi: resourceForm.descriptionHindi.trim() || undefined,
      icon: resourceForm.icon.trim() || 'BookOpen',
      scope: resourceForm.scope,
      type: resourceForm.type,
      status: resourceForm.status,
      provider: resourceForm.provider.trim() || undefined,
      externalUrl: resourceForm.externalUrl.trim(),
      eligibility: resourceForm.eligibility.trim() || undefined,
      benefits: resourceForm.benefits.trim() || undefined,
      howToApply: resourceForm.howToApply.trim() || undefined,
      documentsRequired: splitList(resourceForm.documentsRequired),
      eligibilityHindi: resourceForm.eligibilityHindi.trim() || undefined,
      benefitsHindi: resourceForm.benefitsHindi.trim() || undefined,
      howToApplyHindi: resourceForm.howToApplyHindi.trim() || undefined,
      documentsRequiredHindi: splitList(resourceForm.documentsRequiredHindi),
      providerHindi: resourceForm.providerHindi.trim() || undefined,
      tags: splitList(resourceForm.tags),
      contactName: resourceForm.contactName.trim() || undefined,
      contactMobile: resourceForm.contactMobile.trim(),
      // Sent even when blank: an empty value is how an admin puts the button
      // back to the default "Learn more" label.
      ctaLabel: resourceForm.ctaLabel.trim(),
      ctaLabelHindi: resourceForm.ctaLabelHindi.trim(),
      startDate: resourceForm.startDate,
      endDate: resourceForm.endDate,
      displayOrder: Number(resourceForm.displayOrder) || 0,
      villageId: resourceForm.villageScoped ? activeVillageId : null,
      links: links.map((l, i) => ({ ...l, displayOrder: i })),
    };
    if (resourceForm.slug.trim()) payload.slug = resourceForm.slug.trim().toLowerCase();

    setBusy(true);
    try {
      if (resourceForm.id) {
        await apiClient.patch(`/api/education/resources/${resourceForm.id}`, payload);
      } else {
        await apiClient.post('/api/education/resources', payload);
      }
      setResourceForm(null);
      await loadAll();
      flash('ok', resourceForm.id ? 'Scheme updated' : 'Scheme created');
    } catch (err: any) {
      flash('error', err?.message || 'Failed to save scheme');
    } finally {
      setBusy(false);
    }
  };

  const changeResourceStatus = async (resource: EducationResource, status: EducationStatus) => {
    setBusy(true);
    try {
      await apiClient.patch(`/api/education/resources/${resource.id}/status`, { status });
      setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, status } : r)));
      flash('ok', `"${resource.title}" is now ${status}`);
    } catch (err: any) {
      flash('error', err?.message || 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  // ── ENQUIRIES ──────────────────────────────────────────────────────────────
  const saveEnquiry = async (
    enquiry: EducationEnquiry,
    patch: { status?: EducationEnquiryStatus; response?: string }
  ) => {
    setBusy(true);
    try {
      const data = await apiClient.patch(`/api/education/enquiries/${enquiry.id}`, patch);
      const updated = data?.enquiry;
      setEnquiries((prev) => prev.map((e) => (e.id === enquiry.id ? updated || { ...e, ...patch } : e)));
      if (updated) setActiveEnquiry(updated);
      flash('ok', 'Enquiry updated');
    } catch (err: any) {
      flash('error', err?.message || 'Failed to update enquiry');
    } finally {
      setBusy(false);
    }
  };

  // ── DELETES ────────────────────────────────────────────────────────────────
  const runDelete = async () => {
    if (!confirmTarget) return;
    const path =
      confirmTarget.kind === 'category'
        ? `/api/education/categories/${confirmTarget.id}`
        : confirmTarget.kind === 'resource'
          ? `/api/education/resources/${confirmTarget.id}`
          : `/api/education/enquiries/${confirmTarget.id}`;

    setBusy(true);
    try {
      await apiClient.delete(path);
      setConfirmTarget(null);
      if (activeEnquiry?.id === confirmTarget.id) setActiveEnquiry(null);
      await loadAll();
      flash('ok', `Deleted "${confirmTarget.label}"`);
    } catch (err: any) {
      flash('error', err?.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const newEnquiryCount = enquiries.filter((e) => e.status === 'new').length;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Education Module
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Categories, government schemes, scholarships and career guidance shown on the public
            education pages — plus the help requests students send in.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading || busy}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {view === 'categories' && (
            <Button size="sm" onClick={() => openCategoryEditor()}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Category
            </Button>
          )}
          {view === 'resources' && (
            <Button size="sm" onClick={() => openResourceEditor()} disabled={categories.length === 0}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Scheme
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 text-xs font-bold rounded-xl border ${
            notice.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
            { id: 'resources', label: 'Schemes & Resources', icon: BookOpen, count: resources.length },
            { id: 'enquiries', label: 'Enquiries', icon: Inbox, count: newEnquiryCount || enquiries.length },
          ] as const
        ).map((tab) => {
          const TabIcon = tab.icon;
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                active
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow'
                  : 'bg-white dark:bg-[#121215] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-[#222328] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  active
                    ? 'bg-white/20 dark:bg-black/10'
                    : 'bg-slate-100 dark:bg-[#1e1f24] text-slate-500 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      {view !== 'categories' && (
        <div className={`${cardClass} p-3 flex flex-wrap items-center gap-2.5`}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={view === 'resources' ? 'Search schemes…' : 'Search name, mobile or message…'}
              className={`${inputClass} pl-9`}
            />
          </div>

          {view === 'resources' && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`${inputClass} w-auto`}
              >
                <option value="ALL">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`${inputClass} w-auto`}
              >
                <option value="ALL">Any status</option>
                {CONTENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as any)}
                className={`${inputClass} w-auto`}
              >
                <option value="ALL">Any owner</option>
                <option value="government">Government scheme</option>
                <option value="gramodaya">Gramodaya programme</option>
              </select>
            </>
          )}

          {view === 'enquiries' && (
            <select
              value={enquiryStatusFilter}
              onChange={(e) => setEnquiryStatusFilter(e.target.value as any)}
              className={`${inputClass} w-auto`}
            >
              <option value="ALL">Any status</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {loading ? (
        <SectionSkeleton view={view} />
      ) : (
        <>
          {/* ── CATEGORIES ── */}
          {view === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.length === 0 && (
                <div className={`${cardClass} p-10 text-center text-xs text-slate-500 dark:text-zinc-400 md:col-span-2 xl:col-span-3`}>
                  No categories yet. Create one, or run <code className="font-mono">bun run db:seed:education</code> to
                  load the default set.
                </div>
              )}

              {categories.map((category) => (
                <div key={category.id} className={`${cardClass} p-5 space-y-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {category.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {category.nameHindi || category.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openCategoryEditor(category)}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmTarget({
                            kind: 'category',
                            id: category.id,
                            label: category.name,
                            childCount: resourceCountFor(category.id),
                          })
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {category.overview && (
                    <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                      {category.overview}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={statusVariant(category.status)} className="text-[10px]">
                      {category.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {resourceCountFor(category.id)} schemes
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] inline-flex items-center gap-1">
                      {category.villageId ? (
                        <>
                          <MapPin className="w-2.5 h-2.5" /> village
                        </>
                      ) : (
                        <>
                          <Globe className="w-2.5 h-2.5" /> all villages
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                    <span className="font-mono">/{category.slug}</span>
                    <button
                      onClick={() => {
                        setCategoryFilter(category.id);
                        setView('resources');
                      }}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      View schemes <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── RESOURCES ── */}
          {view === 'resources' && (
            <div className={`${cardClass} overflow-hidden`}>
              {filteredResources.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
                  No schemes match these filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-[#18181c] text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-bold">Scheme</th>
                        <th className="px-4 py-3 font-bold">Category</th>
                        <th className="px-4 py-3 font-bold">Owner</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f24]">
                      {filteredResources.map((resource) => (
                        <tr key={resource.id} className="hover:bg-slate-50/60 dark:hover:bg-[#16161a] transition">
                          <td className="px-4 py-3 max-w-sm">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {resource.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              {resource.titleHindi || resource.description || `/${resource.slug}`}
                            </div>
                            {(resource.links?.length || 0) > 0 && (
                              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                                <Link2 className="w-2.5 h-2.5" />
                                {resource.links!.length} link{resource.links!.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-zinc-300">
                            {categoryName(resource.categoryId)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={resource.scope === 'gramodaya' ? 'emerald' : 'outline'}
                              className="text-[10px]"
                            >
                              {resource.scope === 'gramodaya' ? 'Gramodaya' : 'Government'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={resource.status}
                              onChange={(e) => changeResourceStatus(resource, e.target.value as EducationStatus)}
                              disabled={busy}
                              className="px-2 py-1 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-lg text-[11px] font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
                            >
                              {CONTENT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openResourceEditor(resource)}
                                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                                title="Edit scheme"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmTarget({
                                    kind: 'resource',
                                    id: resource.id,
                                    label: resource.title,
                                  })
                                }
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                                title="Delete scheme"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {view === 'enquiries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEnquiries.length === 0 && (
                <div className={`${cardClass} p-10 text-center text-xs text-slate-500 dark:text-zinc-400 md:col-span-2 xl:col-span-3`}>
                  No education enquiries yet.
                </div>
              )}

              {filteredEnquiries.map((enquiry) => (
                <div key={enquiry.id} className={`${cardClass} p-5 space-y-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {enquiry.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                        📞 {enquiry.mobile}
                        {enquiry.studentClass ? ` · Class ${enquiry.studentClass}` : ''}
                      </p>
                    </div>
                    <Badge variant={statusVariant(enquiry.status)} className="text-[10px] shrink-0">
                      {enquiry.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                    {enquiry.message}
                  </p>

                  {enquiry.resourceId && (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                      About: {resources.find((r) => r.id === enquiry.resourceId)?.title || 'a scheme'}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveEnquiry(enquiry);
                        setEnquiryReply(enquiry.response || '');
                      }}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Open & respond
                    </button>
                    <button
                      onClick={() =>
                        setConfirmTarget({ kind: 'enquiry', id: enquiry.id, label: enquiry.name })
                      }
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete enquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── CATEGORY EDITOR ── */}
      <Dialog
        isOpen={Boolean(categoryForm)}
        onClose={() => setCategoryForm(null)}
        title={categoryForm?.id ? 'Edit Category' : 'New Education Category'}
        description="Categories group the schemes shown on /education."
        maxWidth="2xl"
      >
        {categoryForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name (English) *</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className={inputClass}
                  placeholder="Scholarships & Financial Opportunities"
                />
              </div>
              <div>
                <label className={labelClass}>Name (Hindi)</label>
                <input
                  value={categoryForm.nameHindi}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameHindi: e.target.value })}
                  className={inputClass}
                  placeholder="छात्रवृत्ति एवं आर्थिक अवसर"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className={`${inputClass} font-mono`}
                  placeholder="auto from name"
                />
              </div>
              <div>
                <label className={labelClass}>Icon (lucide name)</label>
                <input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className={`${inputClass} font-mono`}
                  placeholder="Award"
                />
              </div>
              <div>
                <label className={labelClass}>Display order</label>
                <input
                  type="number"
                  min={0}
                  value={categoryForm.displayOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Overview (English)</label>
              <textarea
                rows={3}
                value={categoryForm.overview}
                onChange={(e) => setCategoryForm({ ...categoryForm, overview: e.target.value })}
                className={inputClass}
                placeholder="Paragraph shown at the top of the category page"
              />
            </div>

            <div>
              <label className={labelClass}>Overview (Hindi)</label>
              <textarea
                rows={3}
                value={categoryForm.overviewHindi}
                onChange={(e) => setCategoryForm({ ...categoryForm, overviewHindi: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, status: e.target.value as EducationStatus })
                  }
                  className={inputClass}
                >
                  {CONTENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Visibility</label>
                <select
                  value={categoryForm.villageScoped ? 'village' : 'global'}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, villageScoped: e.target.value === 'village' })
                  }
                  className={inputClass}
                >
                  <option value="global">All villages (platform-wide)</option>
                  <option value="village">This village only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCategoryForm(null)} disabled={busy}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveCategory} disabled={busy}>
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                {categoryForm.id ? 'Save changes' : 'Create category'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── RESOURCE EDITOR ── */}
      <Dialog
        isOpen={Boolean(resourceForm)}
        onClose={() => setResourceForm(null)}
        title={resourceForm?.id ? 'Edit Scheme' : 'New Scheme / Resource'}
        description="Everything except the category and title is optional — publish a short card now and fill in the detail later."
        maxWidth="4xl"
      >
        {resourceForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  value={resourceForm.categoryId}
                  onChange={(e) => setResourceForm({ ...resourceForm, categoryId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Owner</label>
                <select
                  value={resourceForm.scope}
                  onChange={(e) => setResourceForm({ ...resourceForm, scope: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="government">Government scheme</option>
                  <option value="gramodaya">Gramodaya programme</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                  className={inputClass}
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Title (English) *</label>
                <input
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className={inputClass}
                  placeholder="National Scholarship Portal (NSP)"
                />
              </div>
              <div>
                <label className={labelClass}>Title (Hindi)</label>
                <input
                  value={resourceForm.titleHindi}
                  onChange={(e) => setResourceForm({ ...resourceForm, titleHindi: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Description (English)</label>
                <textarea
                  rows={3}
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description (Hindi)</label>
                <textarea
                  rows={3}
                  value={resourceForm.descriptionHindi}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, descriptionHindi: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Eligibility</label>
                <textarea
                  rows={2}
                  value={resourceForm.eligibility}
                  onChange={(e) => setResourceForm({ ...resourceForm, eligibility: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Benefits</label>
                <textarea
                  rows={2}
                  value={resourceForm.benefits}
                  onChange={(e) => setResourceForm({ ...resourceForm, benefits: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>How to apply</label>
                <textarea
                  rows={2}
                  value={resourceForm.howToApply}
                  onChange={(e) => setResourceForm({ ...resourceForm, howToApply: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Eligibility (Hindi)</label>
                <textarea
                  rows={2}
                  value={resourceForm.eligibilityHindi}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, eligibilityHindi: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Benefits (Hindi)</label>
                <textarea
                  rows={2}
                  value={resourceForm.benefitsHindi}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, benefitsHindi: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>How to apply (Hindi)</label>
                <textarea
                  rows={2}
                  value={resourceForm.howToApplyHindi}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, howToApplyHindi: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Documents required (comma separated)</label>
                <input
                  value={resourceForm.documentsRequired}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, documentsRequired: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Aadhaar, Bank passbook, Marksheet"
                />
              </div>
              <div>
                <label className={labelClass}>Documents required (Hindi)</label>
                <input
                  value={resourceForm.documentsRequiredHindi}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, documentsRequiredHindi: e.target.value })
                  }
                  className={inputClass}
                  placeholder="आधार, बैंक पासबुक, अंकतालिका"
                />
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                  value={resourceForm.tags}
                  onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                  className={inputClass}
                  placeholder="class-10, girls, sc-st"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Provider</label>
                <input
                  value={resourceForm.provider}
                  onChange={(e) => setResourceForm({ ...resourceForm, provider: e.target.value })}
                  className={inputClass}
                  placeholder="Ministry of Education"
                />
              </div>
              <div>
                <label className={labelClass}>Provider (Hindi)</label>
                <input
                  value={resourceForm.providerHindi}
                  onChange={(e) => setResourceForm({ ...resourceForm, providerHindi: e.target.value })}
                  className={inputClass}
                  placeholder="शिक्षा मंत्रालय"
                />
              </div>
              <div>
                <label className={labelClass}>Official URL</label>
                <input
                  value={resourceForm.externalUrl}
                  onChange={(e) => setResourceForm({ ...resourceForm, externalUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://scholarships.gov.in"
                />
              </div>
              <div>
                <label className={labelClass}>Icon (lucide name)</label>
                <input
                  value={resourceForm.icon}
                  onChange={(e) => setResourceForm({ ...resourceForm, icon: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Button label</label>
                <input
                  value={resourceForm.ctaLabel}
                  onChange={(e) => setResourceForm({ ...resourceForm, ctaLabel: e.target.value })}
                  className={inputClass}
                  maxLength={40}
                  placeholder="Learn more"
                />
              </div>
              <div>
                <label className={labelClass}>Button label (Hindi)</label>
                <input
                  value={resourceForm.ctaLabelHindi}
                  onChange={(e) => setResourceForm({ ...resourceForm, ctaLabelHindi: e.target.value })}
                  className={inputClass}
                  maxLength={40}
                  placeholder="अधिक जानें"
                />
              </div>
              <p className="sm:col-span-2 text-[10px] text-slate-500 dark:text-zinc-400 -mt-1">
                Shown on the scheme card on the public pages. Leave both blank to keep the default
                &ldquo;Learn more&rdquo;, which already translates itself.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Contact name</label>
                <input
                  value={resourceForm.contactName}
                  onChange={(e) => setResourceForm({ ...resourceForm, contactName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contact mobile</label>
                <input
                  value={resourceForm.contactMobile}
                  onChange={(e) => setResourceForm({ ...resourceForm, contactMobile: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Opens on</label>
                <input
                  type="date"
                  value={resourceForm.startDate}
                  onChange={(e) => setResourceForm({ ...resourceForm, startDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last date</label>
                <input
                  type="date"
                  value={resourceForm.endDate}
                  onChange={(e) => setResourceForm({ ...resourceForm, endDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Links editor */}
            <div className="rounded-xl border border-slate-200 dark:border-[#27272a] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`${labelClass} mb-0`}>Apply / reference links</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    setResourceForm({
                      ...resourceForm,
                      links: [...resourceForm.links, { label: '', url: '', type: 'portal' }],
                    })
                  }
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add link
                </Button>
              </div>

              {resourceForm.links.length === 0 && (
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  No links yet — add the portal students should apply on.
                </p>
              )}

              {resourceForm.links.map((link, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto_auto] gap-2">
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const links = [...resourceForm.links];
                      links[index] = { ...link, label: e.target.value };
                      setResourceForm({ ...resourceForm, links });
                    }}
                    className={inputClass}
                    placeholder="Label"
                  />
                  <input
                    value={link.url}
                    onChange={(e) => {
                      const links = [...resourceForm.links];
                      links[index] = { ...link, url: e.target.value };
                      setResourceForm({ ...resourceForm, links });
                    }}
                    className={`${inputClass} font-mono`}
                    placeholder="https://…"
                  />
                  <select
                    value={link.type}
                    onChange={(e) => {
                      const links = [...resourceForm.links];
                      links[index] = { ...link, type: e.target.value as any };
                      setResourceForm({ ...resourceForm, links });
                    }}
                    className={`${inputClass} w-auto`}
                  >
                    {LINK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setResourceForm({
                        ...resourceForm,
                        links: resourceForm.links.filter((_, i) => i !== index),
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Remove link"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  value={resourceForm.slug}
                  onChange={(e) => setResourceForm({ ...resourceForm, slug: e.target.value })}
                  className={`${inputClass} font-mono`}
                  placeholder="auto from title"
                />
              </div>
              <div>
                <label className={labelClass}>Display order</label>
                <input
                  type="number"
                  min={0}
                  value={resourceForm.displayOrder}
                  onChange={(e) => setResourceForm({ ...resourceForm, displayOrder: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={resourceForm.status}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, status: e.target.value as EducationStatus })
                  }
                  className={inputClass}
                >
                  {CONTENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Visibility</label>
                <select
                  value={resourceForm.villageScoped ? 'village' : 'global'}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, villageScoped: e.target.value === 'village' })
                  }
                  className={inputClass}
                >
                  <option value="global">All villages</option>
                  <option value="village">This village only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setResourceForm(null)} disabled={busy}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveResource} disabled={busy}>
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                {resourceForm.id ? 'Save changes' : 'Create scheme'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── ENQUIRY DETAIL ── */}
      <Dialog
        isOpen={Boolean(activeEnquiry)}
        onClose={() => setActiveEnquiry(null)}
        title={activeEnquiry ? `Enquiry from ${activeEnquiry.name}` : ''}
        description={activeEnquiry?.mobile}
        maxWidth="2xl"
      >
        {activeEnquiry && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] p-4">
              <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {activeEnquiry.message}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#27272a] flex flex-wrap gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                {activeEnquiry.studentClass && <span>Class {activeEnquiry.studentClass}</span>}
                {activeEnquiry.email && <span>{activeEnquiry.email}</span>}
                {activeEnquiry.createdAt && (
                  <span>{new Date(activeEnquiry.createdAt).toLocaleString()}</span>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <div className="flex flex-wrap gap-2">
                {ENQUIRY_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => saveEnquiry(activeEnquiry, { status: s })}
                    disabled={busy}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      activeEnquiry.status === s
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent'
                        : 'bg-white dark:bg-[#121215] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-[#27272a] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Response noted for this enquiry</label>
              <textarea
                rows={4}
                value={enquiryReply}
                onChange={(e) => setEnquiryReply(e.target.value)}
                className={inputClass}
                placeholder="What was advised, which scheme was suggested, who followed up…"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveEnquiry(null)} disabled={busy}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  saveEnquiry(activeEnquiry, { response: enquiryReply, status: 'in_progress' })
                }
                disabled={busy}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Save response
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── DELETE CONFIRMATION ── */}
      <Dialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        title="Confirm delete"
        maxWidth="md"
      >
        {confirmTarget && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Delete <span className="font-bold text-slate-900 dark:text-white">{confirmTarget.label}</span>?
              This cannot be undone.
            </p>

            {confirmTarget.kind === 'category' && confirmTarget.childCount > 0 && (
              <p className="text-xs font-bold p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
                {confirmTarget.childCount} scheme{confirmTarget.childCount > 1 ? 's' : ''} inside this
                category will be deleted with it.
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmTarget(null)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={runDelete} disabled={busy}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
