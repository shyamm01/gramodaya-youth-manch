'use client';

import React from 'react';
import { Search, Users, ShieldCheck } from 'lucide-react';
import { Member } from '../../../types';

interface ChatSidebarProps {
  senderName: string;
  senderPhoto?: string;
  currentMemberObj?: Member;
  activeMembers: Member[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: 'group' | 'admin' | 'personal';
  activePartner: Member | null;
  filteredMembers: Member[];
  onlineUsers: Record<string, boolean>;
  onSelectGroup: () => void;
  onSelectAdmin: () => void;
  onSelectMember: (member: Member) => void;
  onSelectIdCard: (member: Member) => void;
  showMobileChatView: boolean;
  lang: string;
  villagePanchayat: string;
  villagePanchayatHindi: string;
  idCardLabel: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  senderName,
  senderPhoto,
  currentMemberObj,
  activeMembers,
  searchTerm,
  onSearchChange,
  activeTab,
  activePartner,
  filteredMembers,
  onlineUsers,
  onSelectGroup,
  onSelectAdmin,
  onSelectMember,
  showMobileChatView,
  lang,
}) => {
  const isUserOnline = (mobileStr?: string) => {
    if (!mobileStr) return false;
    const digits = mobileStr.replace(/\D/g, '').slice(-10);
    return !!onlineUsers[digits];
  };

  return (
    <div
      className={`w-full md:w-80 lg:w-96 border-r border-[#E0DCCF]/80 dark:border-slate-800 bg-[#FBF9F5] dark:bg-[#0B0F17] flex flex-col transition-colors ${
        showMobileChatView ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Search Input */}
      <div className="p-3 bg-white/80 dark:bg-[#131B2E]/80 backdrop-blur-md border-b border-[#E0DCCF]/80 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C8675] dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={lang === 'en' ? 'Search member...' : 'सदस्य खोजें...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F5F0] dark:bg-[#0B0F17] text-[#2C3327] dark:text-slate-100 border border-[#E0DCCF] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition shadow-2xs"
          />
        </div>
      </div>

      {/* Channels & Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E0DCCF]/40 dark:divide-slate-800/60 scrollbar-thin">
        {/* GROUP CHANNEL */}
        <button
          onClick={onSelectGroup}
          className={`w-full p-3.5 text-left flex items-center justify-between transition cursor-pointer ${
            activeTab === 'group'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600 dark:border-emerald-500'
              : 'hover:bg-white/80 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E3A2F] to-[#2D5545] dark:from-emerald-950 dark:to-emerald-800 text-emerald-300 flex items-center justify-center font-black shadow-xs border border-emerald-500/30 flex-shrink-0">
              <Users className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#2C3327] dark:text-white truncate">
                  {lang === 'en' ? 'Village Forum' : 'ग्रामोदय समूह मंच'}
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                  {lang === 'en' ? 'Public' : 'समूह'}
                </span>
              </div>
              <p className="text-[11px] text-[#8C8675] dark:text-slate-400 truncate mt-0.5 font-medium">
                {lang === 'en' ? 'Open discussion for all members' : 'सभी सदस्यों का सार्वजनिक मंच'}
              </p>
            </div>
          </div>
        </button>

        {/* ADMIN HELPDESK */}
        <button
          onClick={onSelectAdmin}
          className={`w-full p-3.5 text-left flex items-center justify-between transition cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-500'
              : 'hover:bg-white/80 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-700 dark:bg-blue-900 text-white flex items-center justify-center font-black shadow-xs border border-blue-400/30 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-blue-950 dark:text-blue-200 truncate">
                  {lang === 'en' ? 'Admin Helpdesk' : 'एडमिन सहायता'}
                </span>
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-blue-300 dark:border-blue-800">
                  {lang === 'en' ? 'Private' : 'निजी'}
                </span>
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 truncate mt-0.5 font-medium">
                {lang === 'en' ? 'Support & verified inquiries' : 'समस्या समाधान एवं सीधा संवाद'}
              </p>
            </div>
          </div>
        </button>

        {/* 1-TO-1 DIRECT MESSAGES SECTION HEADER */}
        <div className="px-3.5 py-2 bg-[#F0EDE4]/60 dark:bg-slate-900/60 text-[10px] font-black text-[#8C8675] dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{lang === 'en' ? 'Direct Messages' : 'व्यक्तिगत संवाद'}</span>
          <span>{filteredMembers.length}</span>
        </div>

        {/* MEMBER LIST */}
        {filteredMembers.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8C8675] dark:text-slate-400 font-medium">
            {lang === 'en' ? 'No members found.' : 'कोई सदस्य नहीं मिला।'}
          </div>
        ) : (
          filteredMembers.map((m) => {
            const isSelected = activePartner?.id === m.id && activeTab === 'personal';
            const mIdx = activeMembers.findIndex((x) => x.id === m.id);
            const formattedMemberId = `GYM-${String(mIdx + 1).padStart(6, '0')}`;
            const online = isUserOnline(m.mobile);

            return (
              <button
                key={m.id}
                onClick={() => onSelectMember(m)}
                className={`w-full p-3 text-left flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#131B2E] border-l-4 border-emerald-600 dark:border-emerald-500 shadow-2xs'
                    : 'hover:bg-white/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#8C8675]/30 shadow-2xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E0DCCF] dark:bg-slate-800 text-[#2C3327] dark:text-white font-bold text-xs flex items-center justify-center border border-[#8C8675]/30">
                        {m.name.charAt(0)}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                        online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    ></span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#2C3327] dark:text-white truncate">
                        {m.name}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold border border-slate-200 dark:border-slate-700">
                        {formattedMemberId}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C8675] dark:text-slate-400 truncate mt-0.5 font-mono">
                      {m.mobile}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      online
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {online ? (lang === 'en' ? 'Online' : 'ऑनलाइन') : (lang === 'en' ? 'Offline' : 'ऑफलाइन')}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
