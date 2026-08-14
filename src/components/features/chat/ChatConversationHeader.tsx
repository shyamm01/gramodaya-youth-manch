'use client';

import React from 'react';
import { ArrowLeft, Users, ShieldCheck, Phone, CreditCard } from 'lucide-react';
import { Member } from '../../../types';
import { WhatsAppIcon } from '../../common';

interface ChatConversationHeaderProps {
  activeTab: 'group' | 'admin' | 'personal';
  activePartner: Member | null;
  activeMembersCount: number;
  isOnline: boolean;
  onBackToContacts: () => void;
  onSelectIdCard: (member: Member) => void;
  lang: string;
  idCardLabel: string;
  callLabel: string;
  whatsappLabel: string;
}

export const ChatConversationHeader: React.FC<ChatConversationHeaderProps> = ({
  activeTab,
  activePartner,
  activeMembersCount,
  isOnline,
  onBackToContacts,
  onSelectIdCard,
  lang,
  idCardLabel,
  callLabel,
  whatsappLabel,
}) => {
  return (
    <div className="p-3 sm:px-4 bg-white/90 dark:bg-[#131B2E]/90 backdrop-blur-md border-b border-[#E0DCCF]/80 dark:border-slate-800 flex items-center justify-between shadow-2xs transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Back Button for Mobile View */}
        <button
          onClick={onBackToContacts}
          className="md:hidden p-2 bg-[#F0EDE4] hover:bg-[#E4DFD3] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2C3327] dark:text-white rounded-xl cursor-pointer active:scale-95 transition shadow-2xs"
          title={lang === 'en' ? 'Back to Contacts' : 'संपर्क सूची'}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {activeTab === 'group' ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#1E3A2F] to-[#2D5545] dark:from-emerald-950 dark:to-emerald-800 text-emerald-300 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-600/30 shadow-2xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-[#2C3327] dark:text-white truncate">
                {lang === 'en' ? 'Village Forum' : 'ग्रामोदय समूह मंच'}
              </h2>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{activeMembersCount} {lang === 'en' ? 'online members' : 'सक्रिय सदस्य'}</span>
              </p>
            </div>
          </div>
        ) : activeTab === 'admin' ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-700 dark:bg-blue-900 text-white flex items-center justify-center font-bold flex-shrink-0 border border-blue-400/30 shadow-2xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-blue-950 dark:text-blue-200 truncate">
                {lang === 'en' ? 'Admin Helpdesk' : 'एडमिन सहायता'}
              </h2>
              <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">
                🔒 {lang === 'en' ? 'Private Support' : 'निजी संवाद'}
              </p>
            </div>
          </div>
        ) : activePartner ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E0DCCF] dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-emerald-600/40 flex-shrink-0 shadow-2xs">
              {activePartner.photoUrl ? (
                <img
                  src={activePartner.photoUrl}
                  alt={activePartner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-black text-[#2C3327] dark:text-white text-xs sm:text-sm">
                  {activePartner.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-[#2C3327] dark:text-white truncate">
                {activePartner.name}
              </h2>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>{lang === 'en' ? 'Online' : 'ऑनलाइन'}</span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{lang === 'en' ? 'Offline' : 'ऑफलाइन'}</span>
                )}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Actions on Active Partner */}
      {activePartner && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onSelectIdCard(activePartner)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 rounded-xl transition cursor-pointer border border-amber-400/30 text-xs font-bold shadow-2xs active:scale-95"
            title={idCardLabel}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{idCardLabel}</span>
          </button>
          {activePartner.mobile && activePartner.mobile !== 'Information not available' && (
            <>
              <a
                href={`tel:+91${activePartner.mobile.replace(/\D/g, '').slice(-10)}`}
                className="p-1.5 sm:p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
                title={callLabel}
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href={`https://wa.me/91${activePartner.mobile.replace(/\D/g, '').slice(-10)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
                title={whatsappLabel}
              >
                <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};
