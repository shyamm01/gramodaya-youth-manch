'use client';

import React, { useState } from 'react';
import { UserCheck, Sparkles, ShieldCheck, User, Info, MapPin, Shield, Send } from 'lucide-react';
import type { Village } from '@/src/types';
import { AddressFormFields, AddressData } from '@/src/components/common/AddressFormFields';
import { useAddMemberMutation } from '@/src/store/api/adminApi';
import { useAppSelector } from '@/src/store/hooks';

interface MemberCreateModalProps {
  isOpen: boolean;
  villages: Village[];
  defaultVillageId: string;
  defaultState: string;
  defaultDistrict: string;
  onClose: () => void;
}

/**
 * Registering a member and dispatching their activation email.
 *
 * On success the mutation invalidates the Member tag, so the directory behind
 * this modal updates from one refetch of /api/members. The old handler called
 * refreshData(true) instead, which pulled the gallery, the elders list and
 * seven other collections that a new member cannot possibly have changed.
 */
export const MemberCreateModal: React.FC<MemberCreateModalProps> = ({
  isOpen,
  villages,
  defaultVillageId,
  defaultState,
  defaultDistrict,
  onClose,
}) => {
  const [addMember, { isLoading }] = useAddMemberMutation();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('MEMBER');
  const [villageId, setVillageId] = useState(defaultVillageId);
  const [address, setAddress] = useState('');
  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState(defaultDistrict);
  const [message, setMessage] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const close = () => {
    setInviteLink(null);
    setMessage('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !email) {
      setMessage('❌ Please fill in all required fields: Name, Mobile, and Email.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setMessage('❌ Please provide a valid email address.');
      return;
    }

    setMessage('Registering member & generating activation email link...');
    try {
      const res: any = await addMember({
        name: name.trim(),
        mobile: mobile.trim(),
        email: cleanEmail,
        role: role || 'MEMBER',
        systemRole: role || 'MEMBER',
        status: 'active',
        villageId: String(villageId || defaultVillageId),
        address,
        state: state || 'Uttar Pradesh',
        district: district || 'Hardoi',
        adminName: currentUser?.name || 'Administrator',
        adminMobile: currentUser?.mobile || '9506072678',
      }).unwrap();

      const link = res?.inviteLink || null;
      if (link) setInviteLink(link);
      setMessage(
        `✅ Member registered! An invitation & password setup email has been dispatched to ${cleanEmail}.`
      );
      setName('');
      setMobile('');
      setEmail('');
      setAddress('');
      if (!link) setTimeout(close, 3500);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Could not add member'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Register New Member
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create profile & dispatch instant email validation for password setup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {message && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                message.includes('❌')
                  ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="leading-snug">{message}</span>
            </div>
          )}

          {inviteLink && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 space-y-2.5 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Direct Activation Link (One-Time Access)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    setMessage('📋 Activation link copied to clipboard!');
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Copy Link
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full px-3 py-2 bg-white dark:bg-[#151c2e] border border-amber-200 dark:border-amber-800/80 rounded-xl text-[11px] font-mono text-slate-800 dark:text-slate-200 outline-none select-all"
              />
              <p className="text-[10px] text-amber-700/90 dark:text-amber-400 leading-tight">
                Share this link directly with the user if they wish to activate immediately without checking their inbox.
              </p>
            </div>
          )}

          <form id="add-member-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>1. Member Identity & Login Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3.5 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-medium"
                    />
                  </div>
                  <div className="p-2.5 mt-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      An official email validation & password setup link will be dispatched automatically. The member can click the link to set their password, or directly log in using Google Authentication with this email.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Address & Location (Pincode Auto-Fill)</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                  Auto-fills District & State
                </span>
              </div>

              <AddressFormFields
                value={{ fullAddress: address }}
                selectedVillageId={villageId}
                onVillageSelect={(vId) => setVillageId(vId)}
                onChange={(d: AddressData) => {
                  setAddress(d.fullAddress || '');
                  if (d.state) setState(d.state);
                  if (d.district) setDistrict(d.district);
                  if (d.villageId) setVillageId(d.villageId);
                }}
                lang="en"
              />
            </div>

            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>3. Organization & Chapter Assignment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Platform Authority Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  >
                    <option value="MEMBER">Member (Citizen)</option>
                    <option value="ADMIN">Village Admin</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Assigned Chapter
                  </label>
                  <select
                    value={villageId}
                    onChange={(e) => setVillageId(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                * The assigned chapter determines which village unit oversees this member and prints on their Digital ID Card.
              </p>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-member-form"
            disabled={isLoading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Sending…' : 'Send Invitation & Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
