'use client';

import React, { useState } from 'react';
import type { Member, Village } from '@/src/types';
import { AddressFormFields, AddressData } from '@/src/components/common/AddressFormFields';
import { useUpdateMemberMutation } from '@/src/store/api/adminApi';

interface MemberEditorModalProps {
  member: Member;
  villages: Village[];
  onClose: () => void;
}

/**
 * Editing one member.
 *
 * The draft lives in local state on purpose: a half-typed name is not
 * application state, and putting it in the store would dispatch an action per
 * keystroke and re-render every subscriber of the admin slice.
 *
 * What did move to the store is *which* member is being edited. AdminPanel kept
 * a copy of the whole entity plus six mirrored fields, seeded by hand in the
 * row's onClick; if the underlying row changed while the editor was open, the
 * copy went stale and saving wrote the old values back. The parent now keys
 * this component by member id, so the draft is seeded once from current data
 * and thrown away when the editor closes.
 */
const InnerEditor: React.FC<MemberEditorModalProps> = ({ member, villages, onClose }) => {
  const [updateMember, { isLoading }] = useUpdateMemberMutation();

  const [name, setName] = useState(member.name);
  const [mobile, setMobile] = useState(member.mobile);
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>(
    (member.role as any) || 'MEMBER'
  );
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>(
    member.status || 'active'
  );
  const [villageId, setVillageId] = useState(member.villageId || villages[0]?.id || '1');
  const [address, setAddress] = useState(member.address || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating member...');
    try {
      await updateMember({
        id: member.id,
        updates: { name, mobile, role: role as any, status, villageId, address },
      }).unwrap();
      setMessage('✅ Updated successfully!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Member Profile</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Update personal details, role permissions, and chapter assignment
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              1. Member Identity
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/60 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-[#27272a] space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                2. Address & Location (Pincode Auto-Fill)
              </h5>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                Auto-fills District & State
              </span>
            </div>
            <AddressFormFields
              value={{ fullAddress: address }}
              selectedVillageId={villageId}
              onVillageSelect={(vId) => setVillageId(vId)}
              onChange={(d: AddressData) => {
                setAddress(d.fullAddress || '');
                if (d.villageId) setVillageId(d.villageId);
              }}
              lang="en"
            />
          </div>

          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              3. Organization & Chapter Assignment
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Assigned Chapter
                </label>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl cursor-pointer shadow transition"
            >
              {isLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const MemberEditorModal: React.FC<{
  member: Member | null;
  villages: Village[];
  onClose: () => void;
}> = ({ member, villages, onClose }) =>
  member ? (
    <InnerEditor key={member.id} member={member} villages={villages} onClose={onClose} />
  ) : null;
