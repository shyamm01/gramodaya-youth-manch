'use client';

import React from 'react';
import { ArrowLeft, Users, ShieldCheck, Phone, CreditCard, Volume2, VolumeX } from 'lucide-react';
import { Member } from '../../../types';
import { WhatsAppIcon } from '../../common';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

interface ChatConversationHeaderProps {
  activeTab: 'group' | 'admin' | 'personal';
  activePartner: Member | null;
  activeMembersCount: number;
  isOnline: boolean;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
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
  isSoundEnabled,
  onToggleSound,
  onBackToContacts,
  onSelectIdCard,
  lang,
  idCardLabel,
  callLabel,
  whatsappLabel,
}) => {
  return (
    <div className="p-3.5 sm:px-5 bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between shadow-2xs transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Back Button for Mobile View */}
        <Button
          variant="secondary"
          size="icon"
          onClick={onBackToContacts}
          className="md:hidden h-8 w-8 rounded-xl"
          title={lang === 'en' ? 'Back to Contacts' : 'संपर्क सूची'}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        {activeTab === 'group' ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-900 text-emerald-200 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-400/30 shadow-md">
              <Users className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-foreground truncate">
                {lang === 'en' ? 'Village Forum' : 'ग्रामोदय समूह मंच'}
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{activeMembersCount} {lang === 'en' ? 'members active' : 'सदस्य सक्रिय'}</span>
              </p>
            </div>
          </div>
        ) : activeTab === 'admin' ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex items-center justify-center font-bold flex-shrink-0 border border-blue-400/30 shadow-md">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-foreground truncate">
                {lang === 'en' ? 'Admin Helpdesk' : 'ग्रामोदय एडमिन हेल्प'}
              </h2>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                🔒 {lang === 'en' ? 'Official & Confidential' : 'आधिकारिक एवं गोपनीय'}
              </p>
            </div>
          </div>
        ) : activePartner ? (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 border border-emerald-500/40 shadow-sm flex-shrink-0">
              {activePartner.photoUrl ? (
                <AvatarImage src={activePartner.photoUrl} alt={activePartner.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="font-bold text-sm bg-muted text-foreground">
                {activePartner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-foreground truncate">
                {activePartner.name}
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{lang === 'en' ? 'Online' : 'ऑनलाइन'}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground font-medium">
                    {activePartner.villageName || activePartner.gramPanchayat || (lang === 'en' ? 'Member' : 'ग्राम सदस्य')}
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Sound Toggle Button */}
        <Button
          variant={isSoundEnabled ? 'emerald' : 'outline'}
          size="icon"
          onClick={onToggleSound}
          className="h-9 w-9 rounded-xl shadow-xs"
          title={isSoundEnabled ? (lang === 'en' ? 'Mute incoming audio' : 'ऑडियो म्यूट करें') : (lang === 'en' ? 'Unmute audio' : 'ऑडियो चालू करें')}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
        </Button>

        {activePartner && (
          <>
            <Button
              variant="amber"
              size="sm"
              onClick={() => onSelectIdCard(activePartner)}
              className="hidden sm:inline-flex gap-1.5 rounded-xl text-xs font-bold shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{idCardLabel}</span>
            </Button>

            <a
              href={`tel:${activePartner.mobile}`}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition shadow-2xs"
              title={callLabel}
            >
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </a>

            <a
              href={`https://wa.me/91${activePartner.mobile.replace(/\D/g, '').slice(-10)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 transition shadow-2xs"
              title={whatsappLabel}
            >
              <WhatsAppIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
