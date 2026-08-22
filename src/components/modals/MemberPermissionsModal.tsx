'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Lock,
  Layers,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import { SYSTEM_MODULES, ALL_SYSTEM_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@/src/lib/permissions';
import { Member } from '@/src/types';
import { useApp } from '@/src/context/AppContext';
import { apiClient } from '@/src/lib/apiClient';

interface MemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess?: () => void;
}

export const MemberPermissionsModal: React.FC<MemberPermissionsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const { authSession, t } = useApp();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && member?.id) {
      setLoading(true);
      setStatusMsg(null);
      fetch(`/api/permissions/${member.id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSelectedPermissions(data.effectivePermissions || []);
          }
        })
        .catch((err) => {
          console.error('Error fetching member permissions:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, member?.id]);

  if (!isOpen || !member) return null;

  const isSuperAdminUser = member.systemRole === 'SUPER_ADMIN';

  const togglePermission = (code: string) => {
    if (isSuperAdminUser) return;
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModuleAll = (moduleId: string) => {
    if (isSuperAdminUser) return;
    const mod = SYSTEM_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;
    const modCodes = mod.permissions.map((p) => p.code);
    const allSelected = modCodes.every((c) => selectedPermissions.includes(c));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((c) => !modCodes.includes(c as any)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modCodes])));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatusMsg(null);
      // apiClient, not fetch: the JWT lives in localStorage and only axios's
      // interceptor attaches it, so a bare fetch here is an anonymous request
      // and the route answers 401.
      const data = await apiClient.post(`/api/permissions/${member.id}`, {
        permissions: selectedPermissions,
        adminName: authSession.adminName || 'Admin',
        adminMobile: authSession.adminMobile || '',
      });
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'अनुमतियां सफलतापूर्वक अपडेट की गईं!' });
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 800);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'त्रुटि हुई' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'सर्वर से संपर्क करने में त्रुटि हुई' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-[#E0DCCF] dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0DCCF] dark:border-slate-800 flex items-center justify-between bg-[#F8F6F0] dark:bg-[#0B0F17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2C3327] dark:text-white flex items-center gap-2">
                <span>अनुमति प्रबंधन (Permissions Matrix)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {member.name}
                </span>
              </h3>
              <p className="text-[11px] text-[#8C8675] dark:text-slate-400 font-medium">
                भूमिका: <strong className="text-slate-800 dark:text-slate-200">{member.systemRole}</strong> • मोबाइल: {member.mobile}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Notice */}
        {isSuperAdminUser && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>मुख्य प्रशासक (Super Admin):</strong> इस उपयोगकर्ता के पास सिस्टम के सभी मॉड्यूल और सभी ऑपरेशनों की पूर्ण अनियंत्रित अनुमति है।
            </span>
          </div>
        )}

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 font-medium animate-pulse">
              अनुमतियां लोड हो रही हैं...
            </div>
          ) : (
            <div className="space-y-6">
              {SYSTEM_MODULES.map((mod) => {
                const modCodes = mod.permissions.map((p) => p.code);
                const activeInMod = modCodes.filter((c) => selectedPermissions.includes(c)).length;
                const isAllSelected = modCodes.length > 0 && activeInMod === modCodes.length;

                return (
                  <div
                    key={mod.id}
                    className="p-4 rounded-xl border border-[#E0DCCF] dark:border-slate-800/80 bg-[#FCFBF8] dark:bg-[#0F172A]/50 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#E0DCCF]/60 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <span>{mod.nameHindi}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({mod.nameEnglish})</span>
                        </h4>
                        <span className="text-[10px] text-slate-500">{mod.description}</span>
                      </div>

                      {!isSuperAdminUser && (
                        <button
                          type="button"
                          onClick={() => toggleModuleAll(mod.id)}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition"
                        >
                          {isAllSelected ? 'सभी हटाएं' : 'सभी चुनें'} ({activeInMod}/{modCodes.length})
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mod.permissions.map((perm) => {
                        const isGranted = isSuperAdminUser || selectedPermissions.includes(perm.code);

                        return (
                          <button
                            key={perm.code}
                            type="button"
                            disabled={isSuperAdminUser}
                            onClick={() => togglePermission(perm.code)}
                            className={`p-2.5 rounded-lg border text-left flex items-start justify-between gap-2 transition ${
                              isGranted
                                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-100'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            } ${isSuperAdminUser ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold leading-tight">{perm.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {perm.code}
                              </p>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400">{perm.description}</p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isGranted
                                  ? 'bg-purple-600 text-white'
                                  : 'border border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E0DCCF] dark:border-slate-800 flex items-center justify-between bg-[#F8F6F0] dark:bg-[#0B0F17]">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            सक्रिय अनुमतियां:{' '}
            <strong className="text-purple-700 dark:text-purple-400">
              {isSuperAdminUser ? ALL_SYSTEM_PERMISSIONS.length : selectedPermissions.length}
            </strong>{' '}
            / {ALL_SYSTEM_PERMISSIONS.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              रद्द करें
            </button>
            {!isSuperAdminUser && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'सहेज रहे हैं...' : 'अनुमतियां सहेजें'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
