'use client';

import React from 'react';
import { MessageSquare, User, RefreshCw, ShieldCheck } from 'lucide-react';
import { Member } from '../../../types';

interface ChatHeaderBannerProps {
  senderName: string;
  currentMemberObj?: Member;
  activeMembersCount: number;
  onOpenIdentityModal: () => void;
  onRefresh: () => void;
  lang: string;
  orgName: string;
  orgNameHindi: string;
}

export const ChatHeaderBanner: React.FC<ChatHeaderBannerProps> = ({
  senderName,
  currentMemberObj,
  activeMembersCount,
  onOpenIdentityModal,
  onRefresh,
  lang,
  orgName,
  orgNameHindi,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E0DCCF]/60 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/15 border border-emerald-600/30 flex items-center justify-center flex-shrink-0 shadow-2xs">
          <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-[#2C3327] dark:text-white tracking-tight leading-tight">
              {lang === 'en' ? 'Live Community Chat' : 'लाइव संवाद मंच'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {activeMembersCount} {lang === 'en' ? 'Members' : 'सदस्य'}
            </span>
          </div>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 font-medium">
            {lang === 'en' ? orgName : orgNameHindi}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Identity Selector Pill */}
        <button
          onClick={onOpenIdentityModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2C3327] dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer border border-[#D5CFBF] dark:border-slate-700 shadow-2xs active:scale-95"
          title={lang === 'en' ? 'Change your sender identity' : 'पहचान बदलें'}
        >
          <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="truncate max-w-[130px] sm:max-w-[180px]">
            {currentMemberObj ? currentMemberObj.name : senderName}
          </span>
        </button>

        <button
          onClick={onRefresh}
          className="p-2 bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2C3327] dark:text-slate-200 text-xs font-bold rounded-xl border border-[#D5CFBF] dark:border-slate-700 transition cursor-pointer active:scale-95 shadow-2xs"
          title={lang === 'en' ? 'Refresh messages' : 'रिफ्रेश करें'}
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
