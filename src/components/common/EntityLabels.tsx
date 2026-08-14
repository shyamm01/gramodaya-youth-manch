'use client';

/**
 * EntityLabels.tsx
 * ────────────────
 * Reusable label / badge / chip components covering every entity status, role,
 * category, and location type in the Gramodaya Youth Manch app.
 *
 * Exports:
 *  StatusBadge       — ComplaintStatus  (NEW / ACTION IN PROGRESS / RESOLVED)
 *  EventStatusBadge  — EventStatus      (DRAFT / PENDING / PUBLISHED / COMPLETED / CANCELLED)
 *  ContentStatusBadge— SocialWork & PublicInfo status
 *  MemberStatusBadge — Member status    (active / pending / suspended)
 *  RoleBadge         — SystemRole / admin role
 *  CategoryChip      — ComplaintCategory with unique colour per category
 *  ScopeBadge        — RoleScope        (GLOBAL / STATE / DISTRICT / GRAM_PANCHAYAT / VILLAGE)
 *  VillageBadge      — Location pill with MapPin
 *  VerifiedBadge     — Green verified tick
 *  LiveBadge         — Pulsing blue live indicator
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  FileText,
  Globe,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
  User,
  Zap,
  BadgeCheck,
  Radio,
} from 'lucide-react';
import type {
  ComplaintStatus,
  EventStatus,
  SystemRole,
  RoleScope,
  ComplaintCategory,
} from '../../types';

// ─── Size helper ─────────────────────────────────────────────────────────────
type Size = 'xs' | 'sm' | 'md';

const sizeClasses: Record<Size, string> = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  sm: 'text-[11px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1',
};

const iconClass: Record<Size, string> = {
  xs: 'w-2.5 h-2.5 flex-shrink-0',
  sm: 'w-3 h-3 flex-shrink-0',
  md: 'w-3.5 h-3.5 flex-shrink-0',
};

// ─── Internal icon helper ─────────────────────────────────────────────────────
const Icon = ({ as: As, size }: { as: LucideIcon; size: Size }) => (
  <As className={iconClass[size]} />
);

// ─── 1. ComplaintStatus Badge ─────────────────────────────────────────────────
interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: Size;
}

const COMPLAINT_STATUS_MAP: Record<ComplaintStatus, { label: string; classes: string; icon: LucideIcon }> = {
  NEW: {
    label: 'नवीन',
    classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    icon: AlertCircle,
  },
  'ACTION IN PROGRESS': {
    label: 'प्रक्रियाधीन',
    classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  RESOLVED: {
    label: 'निस्तारित',
    classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const cfg = COMPLAINT_STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeClasses[size]} ${cfg.classes}`}>
      <Icon as={cfg.icon} size={size} />
      {cfg.label}
    </span>
  );
};

// ─── 2. EventStatus Badge ─────────────────────────────────────────────────────
interface EventStatusBadgeProps {
  status: EventStatus;
  size?: Size;
}

const EVENT_STATUS_MAP: Record<EventStatus, { label: string; classes: string; icon: LucideIcon }> = {
  DRAFT: {
    label: 'Draft',
    classes: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
    icon: FileText,
  },
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  PUBLISHED: {
    label: 'Published',
    classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    icon: BadgeCheck,
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    icon: XCircle,
  },
};

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const cfg = EVENT_STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeClasses[size]} ${cfg.classes}`}>
      <Icon as={cfg.icon} size={size} />
      {cfg.label}
    </span>
  );
};

// ─── 3. Content Status Badge (SocialWork / PublicInfo) ───────────────────────
type ContentStatus = 'pending' | 'approved' | 'published' | 'rejected';

interface ContentStatusBadgeProps {
  status: ContentStatus;
  size?: Size;
}

const CONTENT_STATUS_MAP: Record<ContentStatus, { label: string; classes: string; icon: LucideIcon }> = {
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  published: {
    label: 'Published',
    classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    icon: Eye,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    icon: XCircle,
  },
};

export const ContentStatusBadge: React.FC<ContentStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const cfg = CONTENT_STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeClasses[size]} ${cfg.classes}`}>
      <Icon as={cfg.icon} size={size} />
      {cfg.label}
    </span>
  );
};

// ─── 4. Member Status Badge ───────────────────────────────────────────────────
type MemberStatus = 'active' | 'pending' | 'suspended';

interface MemberStatusBadgeProps {
  status: MemberStatus;
  size?: Size;
}

const MEMBER_STATUS_MAP: Record<MemberStatus, { label: string; classes: string; dot: string }> = {
  active: {
    label: 'Active',
    classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  suspended: {
    label: 'Suspended',
    classes: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

export const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const cfg = MEMBER_STATUS_MAP[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeClasses[size]} ${cfg.classes}`}>
      <span className={`rounded-full flex-shrink-0 ${iconClass[size]} ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── 5. Role Badge ────────────────────────────────────────────────────────────
interface RoleBadgeProps {
  role: SystemRole | 'ADMIN' | 'MEMBER' | 'PUBLIC' | string;
  size?: Size;
}

const ROLE_MAP: Record<string, { label: string; classes: string; icon: LucideIcon }> = {
  SUPER_ADMIN: { label: 'Super Admin', classes: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800', icon: Zap },
  ADMIN:       { label: 'Admin',       classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800', icon: Shield },
  MEMBER:      { label: 'Member',      classes: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', icon: User },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const cfg = ROLE_MAP[role] ?? {
    label: role,
    classes: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    icon: User,
  };
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeClasses[size]} ${cfg.classes}`}>
      <Icon as={cfg.icon} size={size} />
      {cfg.label}
    </span>
  );
};

// ─── 6. Category Chip (Complaint) ─────────────────────────────────────────────
const CATEGORY_COLOUR: Record<string, string> = {
  Water:              'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800',
  Road:               'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
  Electricity:        'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  Cleanliness:        'bg-lime-50 dark:bg-lime-950/40 text-lime-800 dark:text-lime-200 border-lime-200 dark:border-lime-800',
  Environment:        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
  Education:          'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
  Health:             'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  Sanitation:         'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800',
  'Animal-related':   'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  'Social Issue':     'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  'Government Service': 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  Other:              'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

interface CategoryChipProps {
  category: ComplaintCategory | string;
  size?: Size;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, size = 'sm' }) => {
  const classes = CATEGORY_COLOUR[category] ??
    'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeClasses[size]} ${classes}`}>
      {category}
    </span>
  );
};

// ─── 7. Scope Badge ───────────────────────────────────────────────────────────
const SCOPE_MAP: Record<RoleScope, { label: string; classes: string }> = {
  GLOBAL:  { label: 'Global',  classes: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800' },
  VILLAGE: { label: 'Village', classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' },
};

interface ScopeBadgeProps {
  scope: RoleScope;
  size?: Size;
}

export const ScopeBadge: React.FC<ScopeBadgeProps> = ({ scope, size = 'sm' }) => {
  const cfg = SCOPE_MAP[scope];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full border ${sizeClasses[size]} ${cfg.classes}`}>
      <Globe className={iconClass[size]} />
      {cfg.label}
    </span>
  );
};

// ─── 8. Village Badge (location pill) ────────────────────────────────────────
interface VillageBadgeProps {
  village: string;
  gramPanchayat?: string;
  /** 'light' = on a white card, 'dark' = on a dark/hero bg */
  variant?: 'light' | 'dark';
  size?: Size;
  pulse?: boolean;
}

export const VillageBadge: React.FC<VillageBadgeProps> = ({
  village,
  gramPanchayat,
  variant = 'light',
  size = 'sm',
  pulse = false,
}) => {
  const base = variant === 'dark'
    ? 'bg-white/10 border-white/15 text-emerald-200'
    : 'bg-[#E8F2EC] dark:bg-emerald-950/40 border-[#B3D6C2] dark:border-emerald-800 text-[#2D5545] dark:text-emerald-200';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses[size]} ${base}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />}
      <MapPin className={`${iconClass[size]} mr-0.5`} />
      {village && !village.includes("undefined") ? village : "Rasoolpur"}
      {gramPanchayat && !gramPanchayat.includes("undefined") && <span className="opacity-60 ml-0.5">· {gramPanchayat}</span>}
    </span>
  );
};


// ─── 9. Verified Badge ────────────────────────────────────────────────────────
interface VerifiedBadgeProps {
  size?: Size;
  label?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'sm', label = 'Verified' }) => (
  <span className={`inline-flex items-center font-bold rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ${sizeClasses[size]}`}>
    <BadgeCheck className={iconClass[size]} />
    {label}
  </span>
);

// ─── 10. Live Badge ───────────────────────────────────────────────────────────
interface LiveBadgeProps {
  size?: Size;
  label?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ size = 'sm', label = 'Live' }) => (
  <span className={`inline-flex items-center font-black rounded-full border bg-blue-600 dark:bg-blue-700 text-white border-blue-400/40 ${sizeClasses[size]}`}>
    <Radio className={`${iconClass[size]} animate-pulse`} />
    {label}
  </span>
);
