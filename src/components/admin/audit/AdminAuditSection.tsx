'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  Shield,
  Clock,
  User,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Sparkles,
  Layers,
  KeyRound,
  FileText,
  UserCheck,
  Eye,
  Crown,
  Phone,
  Target,
  ArrowRight,
  Filter,
  Calendar,
  Contact,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { useGetMembersQuery } from '@/src/store/api/adminApi';
import type { Member } from '@/src/types';
import { AuditLogItem } from '@/app/api/audit/route';
import { isSuperAdmin as checkIsSuperAdmin } from '@/src/lib/permissions';

let cachedAuditLogs: AuditLogItem[] | null = null;
let inFlightAuditPromise: Promise<AuditLogItem[]> | null = null;

export const clearAuditCache = () => {
  cachedAuditLogs = null;
  inFlightAuditPromise = null;
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; icon: any }> = {
  SUCCESS: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  INFO: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    icon: Info,
  },
  WARNING: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  CRITICAL: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
};

const ROLE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  SUPER_ADMIN: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  ADMIN: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  VOLUNTEER: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  SYSTEM: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
};


const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `42260727-30ef-4247-aaa1-0fea69257f1e` → `42260727…57f1e`. */
const shortenId = (id: string) => (id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-5)}` : id);

export interface AuditIdentity {
  name: string;
  role?: string;
  contact?: string | null;
  photoUrl?: string | null;
  /** Full id, kept for the title attribute so the raw value is still reachable. */
  id?: string;
  /** False when the row points at an id no current member matches. */
  resolved: boolean;
}


/**
 * The photo disc, shared by the table columns and the detail modal.
 *
 * The initial sits underneath and the photo covers it when there is one. A
 * photo that 404s hides itself, which uncovers the initial again — the same
 * layering ui/avatar uses, so a dead URL never leaves an empty square.
 */
const IdentityAvatar: React.FC<{
  name: string;
  photoUrl?: string | null;
  resolved?: boolean;
  size?: 'sm' | 'md';
}> = ({ name, photoUrl, resolved = true, size = 'sm' }) => (
  <div
    className={`relative rounded-xl border overflow-hidden font-bold flex items-center justify-center flex-shrink-0 ${
      size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
    } ${
      resolved
        ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
    }`}
  >
    <span>{resolved ? name.charAt(0).toUpperCase() : '?'}</span>
    {photoUrl && (
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    )}
  </div>
);

/**
 * One person, rendered the same way wherever they appear in the log.
 *
 * The actor column already looked like this — disc, name, role badge, contact.
 * The target column printed `log.targetUser` raw, which for permission changes
 * is a member UUID, and then repeated the same UUID underneath as
 * "Member: <uuid>". Two columns describing the same kind of thing looked
 * nothing alike, and neither told you who the person actually was.
 *
 * Both columns share this now, so they cannot drift apart again.
 */
const IdentityChip: React.FC<AuditIdentity> = ({ name, role, contact, photoUrl, id, resolved }) => {
  const roleStyle = ROLE_STYLES[role || 'SUPER_ADMIN'] || ROLE_STYLES.SUPER_ADMIN;
  return (
    <div className="flex items-center gap-2.5">
      <IdentityAvatar name={name} photoUrl={photoUrl} resolved={resolved} />
      <div className="min-w-0">
        <div
          className={`font-bold text-xs truncate ${
            resolved
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 font-mono'
          }`}
          title={id || name}
        >
          {name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {resolved ? (
            <>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border}`}
              >
                {role || 'MEMBER'}
              </span>
              {contact && (
                <span className="text-[10px] text-slate-400 font-mono">{contact}</span>
              )}
            </>
          ) : (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              NOT FOUND
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminAuditSection: React.FC = () => {
  const { authSession } = useApp();

  // The log stores who a change was applied to as a member id. Resolving it
  // needs the directory, which RTK Query already has cached for the members
  // screen — mounting this section reuses that entry rather than refetching.
  const { data: members = [] } = useGetMembersQuery();
  const membersById = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(String(m.id), m));
    return map;
  }, [members]);

  /**
   * Turns a log row's target into a person.
   *
   * `targetUser` is sometimes a display name written at the time and sometimes
   * a member UUID; when it is a UUID the id also shows up inside targetEntity
   * as "Member: <uuid>". Both routes are tried before giving up, and giving up
   * still shortens the id rather than printing 36 characters into the column.
   */
  const resolveTarget = useCallback(
    (log: AuditLogItem): AuditIdentity | null => {
      const raw = (log.targetUser || '').trim();
      const fromEntity = (log.targetEntity || '').match(
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
      )?.[1];
      const id = UUID_RE.test(raw) ? raw : fromEntity;

      if (id) {
        const member = membersById.get(id);
        if (member) {
          return {
            name: member.name,
            role: member.role || member.systemRole || 'MEMBER',
            contact: member.mobile,
            photoUrl: member.photoUrl,
            id,
            resolved: true,
          };
        }
        return { name: shortenId(id), id, resolved: false };
      }

      // Not an id at all — a name recorded when the entry was written.
      if (raw) return { name: raw, role: 'MEMBER', resolved: true };
      return null;
    },
    [membersById]
  );

  /**
   * The actor's identity, with their photo when we can find them.
   *
   * The name, role and contact still come from the log rather than the
   * directory: they record who this person was at the time they acted, and a
   * later rename or demotion must not rewrite history. Only the photo is looked
   * up, because the log never stored one.
   */
  const resolveActor = useCallback(
    (log: AuditLogItem): AuditIdentity => {
      const byId = log.userId ? membersById.get(String(log.userId)) : undefined;
      const member =
        byId ||
        (log.userContact
          ? members.find((m) => m.mobile === log.userContact)
          : undefined);

      return {
        name: log.userName,
        role: log.userRole || 'SUPER_ADMIN',
        contact: log.userContact,
        photoUrl: member?.photoUrl,
        id: log.userId || undefined,
        resolved: true,
      };
    },
    [membersById, members]
  );

  const isSuper = Boolean(
    checkIsSuperAdmin(authSession) ||
    authSession.systemRole === 'SUPER_ADMIN' ||
    authSession.role === 'SUPER_ADMIN' ||
    authSession.adminMobile === '9506072678'
  );

  const [logs, setLogs] = useState<AuditLogItem[]>(() => cachedAuditLogs || []);
  const [loading, setLoading] = useState<boolean>(!cachedAuditLogs);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [inspectingLog, setInspectingLog] = useState<AuditLogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Audit Logs with Cache & Promise Deduplication
  const fetchAuditLogs = async (forceRefresh = false) => {
    if (!forceRefresh && cachedAuditLogs) {
      setLogs(cachedAuditLogs);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      if (!inFlightAuditPromise || forceRefresh) {
        inFlightAuditPromise = fetch('/api/audit?scope=permissions&limit=200')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.logs)) {
              cachedAuditLogs = data.logs;
              return data.logs;
            }
            return [];
          })
          .finally(() => {
            inFlightAuditPromise = null;
          });
      }

      const result = await inFlightAuditPromise;
      if (result && Array.isArray(result) && result.length > 0) {
        setLogs(result);
      }
    } catch (err: any) {
      console.error('Failed to fetch permission audit logs:', err);
      showToast('Error loading audit logs from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filtered Logs (Strictly Permission & Role Updates)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const act = log.action.toUpperCase();

      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.targetUser || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Typing a member's name should find rows that only store their id.
        (resolveTarget(log)?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.targetEntity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userContact || '').includes(searchQuery) ||
        (log.ipAddress || '').includes(searchQuery);

      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'MATRIX' && (act.includes('UPDATE_PERMISSIONS') || act.includes('POLICY_PERMISSIONS'))) ||
        (categoryFilter === 'ROLE_ASSIGN' && (act.includes('ROLE_ASSIGNMENT') || act.includes('ROLE_ASSIGNED'))) ||
        (categoryFilter === 'ROLE_TEMPLATE' && (act.includes('ROLE_POLICY') || act.includes('ROLE_CREATED') || act.includes('ROLE_UPDATED')));

      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [logs, searchQuery, categoryFilter, severityFilter, resolveTarget]);

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, severityFilter, pageSize]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const startIndex = filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredLogs.length);

  // Statistics tailored for Permissions
  const stats = useMemo(() => {
    const total = logs.length;
    const matrixUpdates = logs.filter((l) => l.action.includes('UPDATE_PERMISSIONS') || l.action.includes('POLICY_PERMISSIONS')).length;
    const roleAssignments = logs.filter((l) => l.action.includes('ROLE_ASSIGNMENT') || l.action.includes('ROLE_ASSIGNED')).length;
    const templateChanges = logs.filter((l) => l.action.includes('ROLE_POLICY') || l.action.includes('ROLE_CREATED') || l.action.includes('ROLE_UPDATED')).length;
    return { total, matrixUpdates, roleAssignments, templateChanges };
  }, [logs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast('No permission audit records to export.');
      return;
    }
    const headers = [
      'ID',
      'Timestamp',
      'Performed By (Admin Actor)',
      'Actor Role',
      'Target Member (Name)',
      'Target Member (ID)',
      'Target Entity',
      'Action Code',
      'Severity',
      'Event Details',
      'Origin IP',
    ];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      l.userRole || 'SUPER_ADMIN',
      `"${resolveTarget(l)?.name || l.targetUser || ''}"`,
      `"${l.targetUser || ''}"`,
      `"${l.targetEntity || ''}"`,
      l.action,
      l.severity || 'INFO',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ipAddress || '127.0.0.1',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `permission_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported permission audit logs to CSV successfully!');
  };

  const formatDateTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return { date: dateStr, time: timeStr };
    } catch {
      return { date: ts, time: '' };
    }
  };

  const formatActionTitle = (action: string) => {
    if (action === 'UPDATE_PERMISSIONS' || action === 'POLICY_PERMISSIONS_UPDATE') {
      return 'Update Permissions';
    }
    if (action === 'ROLE_ASSIGNMENT' || action === 'ROLE_ASSIGNED') {
      return 'Assign Role';
    }
    if (action === 'ROLE_POLICY_UPDATE') {
      return 'Role Policy Update';
    }
    if (action === 'ROLE_CREATED') {
      return 'Create Custom Role';
    }
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
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

      {/* ── 1. AUDIT HEADER & METRICS ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Permission Audit Logs
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Permission Modifications
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Complete traceability of user permissions modifications, capability matrix updates, and role assignments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => fetchAuditLogs(true)}
              disabled={loading}
              title="Refresh permission audit logs from database"
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Permission Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Permission Events</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Permission audit records</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/40">
            <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Matrix Updates</div>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">{stats.matrixUpdates}</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">Granular PBAC modifications</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Role Assignments</div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">{stats.roleAssignments}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Member authority changes</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Role Template Edits</div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{stats.templateChanges}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Role definitions updated</div>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & MULTI-FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, target member, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="ALL">All Permission Updates</option>
            <option value="MATRIX">Matrix Updates (UPDATE_PERMISSIONS)</option>
            <option value="ROLE_ASSIGN">Role Assignments (ROLE_ASSIGNMENT)</option>
            <option value="ROLE_TEMPLATE">Role Policy Templates (ROLE_POLICY)</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="SUCCESS">Success</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* ── 3. PERMISSION AUDIT LOGS TABLE & PAGINATION ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-purple-600" />
            <p className="text-xs font-medium">Fetching permission audit trail from database...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <KeyRound className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No permission updates found</p>
            <p className="text-xs">Try clearing search keywords or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/90 dark:bg-[#151c2e] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800 select-none">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">#</th>
                    <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Date & Time</th>
                    <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Performed By</th>
                    <th className="py-3.5 px-4 min-w-[180px] whitespace-nowrap">Action Type</th>
                    <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">Target Member</th>
                    <th className="py-3.5 px-4 min-w-[260px] whitespace-nowrap">Summary & Details</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px] whitespace-nowrap">Severity</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px] whitespace-nowrap">Origin IP</th>
                    <th className="py-3.5 px-4 text-right min-w-[80px] whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {paginatedLogs.map((log, index) => {
                    const severity = log.severity || 'INFO';
                    const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.INFO;
                    const Icon = style.icon;
                    const { date, time } = formatDateTime(log.timestamp);
                    const actionTitle = formatActionTitle(log.action);
                    const target = resolveTarget(log);

                    return (
                      <tr
                        key={log.id || index}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                      >
                        {/* # ID */}
                        <td className="py-4 px-4 text-center font-mono text-slate-400 text-[11px]">
                          {log.id || (currentPage - 1) * pageSize + index + 1}
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 font-mono text-[11px] whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{date}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{time}</span>
                          </div>
                        </td>

                        {/* Actor (Performed By) */}
                        <td className="py-4 px-4">
                          <IdentityChip {...resolveActor(log)} />
                        </td>

                        {/* Action Type */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {actionTitle}
                          </div>
                          <div className="font-mono text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                            {log.action}
                          </div>
                        </td>

                        {/* Target Member — same chip as the actor column */}
                        <td className="py-4 px-4">
                          {target ? (
                            <IdentityChip {...target} />
                          ) : log.targetEntity ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              <Target className="w-3 h-3 text-purple-500" />
                              <span className="truncate max-w-[140px]" title={log.targetEntity}>
                                {log.targetEntity}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Summary & Details */}
                        <td className="py-4 px-4 max-w-sm">
                          <p className="text-slate-700 dark:text-slate-300 text-xs truncate" title={log.details || ''}>
                            {log.details || '—'}
                          </p>
                        </td>

                        {/* Severity */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${style.bg} ${style.text} border ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span>{severity}</span>
                          </span>
                        </td>

                        {/* Origin IP */}
                        <td className="py-4 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            {log.ipAddress || '127.0.0.1'}
                          </span>
                        </td>

                        {/* Inspect Trigger */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingLog(log)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                            title="Inspect Permission Event"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── 4. PAGINATION CONTROLS FOOTER ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:px-6 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <span>
                  Showing <strong className="text-slate-800 dark:text-slate-200">{startIndex}</strong> to{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{endIndex}</strong> of{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{filteredLogs.length}</strong> permission records
                </span>

                <span className="text-slate-300 dark:text-slate-700">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, i, arr) => {
                      const prev = arr[i - 1];
                      const isEllipsis = prev && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {isEllipsis && (
                            <span className="px-1 text-slate-400 font-mono">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[32px] h-8 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                              currentPage === page
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── 5. INSPECT AUDIT EVENT MODAL ── */}
      {inspectingLog && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Permission Event #{inspectingLog.id}
                  </h3>
                  <p className="text-xs font-mono text-purple-600 dark:text-purple-400">
                    {inspectingLog.action}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Actor Card: Admin Who Performed the Action */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Admin Actor (Who Changed Permissions)</span>
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IdentityAvatar
                      name={inspectingLog.userName}
                      photoUrl={resolveActor(inspectingLog).photoUrl}
                      size="md"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {inspectingLog.userName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{inspectingLog.userContact || 'Administrator'}</span>
                        <span>·</span>
                        <span>Rasoolpur Chapter</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-mono font-bold text-[10px]">
                    {inspectingLog.userRole || 'SUPER_ADMIN'}
                  </span>
                </div>
              </div>

              {/* Target User Card: Whose Permissions were Modified */}
              {inspectingLog.targetUser && (
                <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Target Member / User Modified</span>
                  </span>
                  <div className="flex items-center justify-between">
                    {(() => {
                      const target = resolveTarget(inspectingLog);
                      return target ? (
                        <IdentityChip {...target} />
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      );
                    })()}
                    <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-mono font-bold text-[10px]">
                      PERMISSION TARGET
                    </span>
                  </div>
                </div>
              )}

              {/* Event Description */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Policy Modifications Summary</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {inspectingLog.details || 'No extended payload available.'}
                </p>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Origin IP Address</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{inspectingLog.ipAddress || '127.0.0.1'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exact Timestamp</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {formatDateTime(inspectingLog.timestamp).date} {formatDateTime(inspectingLog.timestamp).time}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
