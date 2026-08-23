'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
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

export const AdminAuditSection: React.FC = () => {
  const { authSession } = useApp();

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
        inFlightAuditPromise = fetch('/api/audit?limit=100')
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
      console.error('Failed to fetch audit logs:', err);
      showToast('Error loading audit logs from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.targetUser || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.targetEntity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userContact || '').includes(searchQuery) ||
        (log.ipAddress || '').includes(searchQuery);

      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'PROFILE' && (log.action.includes('PROFILE') || log.action.includes('MEMBER'))) ||
        (categoryFilter === 'AUTH' && log.action.includes('AUTH')) ||
        (categoryFilter === 'POLICY' && log.action.includes('POLICY')) ||
        (categoryFilter === 'MODULE' && log.action.includes('MODULE')) ||
        (categoryFilter === 'GRIEVANCE' && log.action.includes('GRIEVANCE'));

      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [logs, searchQuery, categoryFilter, severityFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const profileUpdates = logs.filter((l) => l.action.includes('PROFILE') || l.action.includes('MEMBER')).length;
    const adminActions = logs.filter((l) => l.action.includes('POLICY') || l.action.includes('MODULE') || l.action.includes('ROLE')).length;
    const authEvents = logs.filter((l) => l.action.includes('AUTH') || l.action.includes('LOGIN')).length;
    return { total, profileUpdates, adminActions, authEvents };
  }, [logs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast('No audit records to export.');
      return;
    }
    const headers = [
      'ID',
      'Timestamp',
      'Performed By (Actor)',
      'Actor Role',
      'Actor Contact',
      'Whose Profile / Target Subject',
      'Action Code',
      'Severity',
      'Event Details',
      'IP Address',
    ];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      l.userRole || 'ADMIN',
      `"${l.userContact || ''}"`,
      `"${l.targetUser || l.targetEntity || ''}"`,
      l.action,
      l.severity || 'INFO',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ipAddress || '127.0.0.1',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported audit logs to CSV successfully!');
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
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Security & Audit Logs
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Live Audit Trail
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Complete traceability: see who performed each action, whose profile was modified, and exact change history.
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
              title="Refresh logs from database"
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Recorded Events</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Database audit records</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Profile & KYC Updates</div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{stats.profileUpdates}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Member accounts modified</div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/40">
            <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Admin Governance</div>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">{stats.adminActions}</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">Policy, roles & modules</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Auth & Logins</div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">{stats.authEvents}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">OTP logins & sessions</div>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & MULTI-FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actor, profile owner, action, or IP..."
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
            <option value="ALL">All Categories</option>
            <option value="PROFILE">Profile & Member Updates</option>
            <option value="POLICY">Policy & Permissions</option>
            <option value="MODULE">Module Toggles</option>
            <option value="AUTH">Auth & Logins</option>
            <option value="GRIEVANCE">Grievances</option>
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

      {/* ── 3. AUDIT LOGS TABLE ── */}
      <div className="bg-white dark:bg-[#111726] border border-[#E4DFD5] dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-purple-600" />
            <p className="text-xs font-medium">Fetching live audit logs from database...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Activity className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No audit events found</p>
            <p className="text-xs">Try clearing search keywords or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-36">Date & Time</th>
                  <th className="py-3.5 px-4 w-52">Actor (Performed By)</th>
                  <th className="py-3.5 px-4 w-48">Whose Profile / Subject</th>
                  <th className="py-3.5 px-4 w-48">Action Type</th>
                  <th className="py-3.5 px-4">Summary & Details</th>
                  <th className="py-3.5 px-4 text-center w-24">Severity</th>
                  <th className="py-3.5 px-4 text-center w-28">Origin IP</th>
                  <th className="py-3.5 px-4 text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredLogs.map((log, index) => {
                  const severity = log.severity || 'INFO';
                  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.INFO;
                  const Icon = style.icon;
                  const roleStyle = ROLE_STYLES[log.userRole || 'ADMIN'] || ROLE_STYLES.ADMIN;
                  const { date, time } = formatDateTime(log.timestamp);
                  const actionTitle = formatActionTitle(log.action);
                  const isProfileUpdate = log.action.includes('PROFILE') || log.action.includes('MEMBER');

                  return (
                    <tr
                      key={log.id || index}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                    >
                      {/* # ID */}
                      <td className="py-4 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {log.id || index + 1}
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
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {log.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {log.userName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border}`}>
                                {log.userRole || 'ADMIN'}
                              </span>
                              {log.userContact && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {log.userContact}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Whose Profile / Target Subject */}
                      <td className="py-4 px-4">
                        {log.targetUser ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                              {log.targetUser.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs">
                                {log.targetUser}
                              </div>
                              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                {isProfileUpdate ? 'Member Profile' : 'Target Account'}
                              </span>
                            </div>
                          </div>
                        ) : log.targetEntity ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <Target className="w-3 h-3 text-purple-500" />
                            <span className="truncate max-w-[120px]" title={log.targetEntity}>
                              {log.targetEntity}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
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

                      {/* Summary & Details */}
                      <td className="py-4 px-4 max-w-xs">
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
                          title="Inspect Event Payload"
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
        )}
      </div>

      {/* ── 4. INSPECT AUDIT EVENT MODAL ── */}
      {inspectingLog && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Audit Event #{inspectingLog.id}
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
              {/* Actor Card: Who Performed the Action */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Action Performed By (Actor)</span>
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {inspectingLog.userName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{inspectingLog.userContact || 'Chapter Administrator'}</span>
                      <span>·</span>
                      <span>Rasoolpur Chapter</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-mono font-bold text-[10px]">
                    {inspectingLog.userRole || 'ADMIN'}
                  </span>
                </div>
              </div>

              {/* Target Profile Card: Whose Profile was Updated */}
              {inspectingLog.targetUser && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Contact className="w-3.5 h-3.5" />
                    <span>Whose Profile Was Updated (Target User)</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center">
                        {inspectingLog.targetUser.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {inspectingLog.targetUser}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Registered Community Member · Rasoolpur Chapter
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[10px]">
                      MEMBER PROFILE
                    </span>
                  </div>
                </div>
              )}

              {/* Target & Subject Card (if non-user entity) */}
              {!inspectingLog.targetUser && inspectingLog.targetEntity && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-purple-600" />
                    <span>Target Subject Entity</span>
                  </span>
                  <span className="font-bold font-mono text-purple-600 dark:text-purple-400">
                    {inspectingLog.targetEntity}
                  </span>
                </div>
              )}

              {/* Event Description */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Event Summary & Change Log</span>
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
