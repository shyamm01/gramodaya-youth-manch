'use client';

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Member } from '../../../types';

interface ChatIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileInput: string;
  onMobileInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loginError: string;
  activeMembers: Member[];
  onSelectMember: (m: Member) => void;
  lang: string;
  villageName: string;
  villageNameHindi: string;
}

export const ChatIdentityModal: React.FC<ChatIdentityModalProps> = ({
  isOpen,
  onClose,
  mobileInput,
  onMobileInputChange,
  onSubmit,
  loginError,
  activeMembers,
  onSelectMember,
  lang,
  villageName,
  villageNameHindi,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0DCCF] dark:border-slate-800 relative text-[#2C3327] dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8675] hover:text-[#2C3327] dark:text-slate-400 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#2C3327] dark:text-white">
            {lang === 'en' ? 'Confirm Member Identity' : 'सदस्य पहचान की पुष्टि करें'}
          </h3>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 font-medium">
            {lang === 'en'
              ? `Active verified members of ${villageName}:`
              : `ग्राम ${villageNameHindi} के स्वीकृत सदस्य:`}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Registered Mobile Number *' : 'पंजीकृत मोबाइल नंबर *'}
            </label>
            <input
              type="text"
              required
              placeholder="उदा. 9876543210"
              value={mobileInput}
              onChange={(e) => onMobileInputChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-slate-100 border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {loginError && (
            <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition active:scale-95"
          >
            {lang === 'en' ? 'Verify & Continue' : 'पुष्टि करें'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#E0DCCF] dark:border-slate-800">
          <p className="text-xs font-bold text-[#8C8675] dark:text-slate-400 mb-2">
            {lang === 'en' ? 'Or select from active list:' : 'या सूची में से चुनें:'}
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {activeMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMember(m)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F0] dark:bg-[#0B0F17] hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left cursor-pointer transition"
              >
                <span className="text-xs font-bold text-[#2C3327] dark:text-white">{m.name}</span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{m.mobile}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
