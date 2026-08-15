'use client';

import React, { useState } from 'react';
import { Search, Users, ShieldCheck, MessageCircle, X, ChevronRight } from 'lucide-react';
import { Member } from '../../../types';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';

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
  const [filterMode, setFilterMode] = useState<string>('ALL');

  const isUserOnline = (mobileStr?: string) => {
    if (!mobileStr) return false;
    const digits = mobileStr.replace(/\D/g, '').slice(-10);
    return !!onlineUsers[digits];
  };

  const onlineCount = Object.keys(onlineUsers).length;

  const memberPool =
    filteredMembers.length > 0
      ? filteredMembers
      : activeMembers.filter((m) => !currentMemberObj || m.id !== currentMemberObj.id);

  const displayedMembers = memberPool.filter((m) => {
    if (filterMode === 'ONLINE') return isUserOnline(m.mobile);
    if (filterMode === 'DIRECT') return true;
    return true;
  });

  return (
    <div
      className={`w-full md:w-80 lg:w-96 border-r border-border bg-card/50 flex flex-col transition-colors ${
        showMobileChatView ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* 1. Search Bar & Tabs Filter */}
      <div className="p-3.5 bg-card border-b border-border space-y-3">
        {/* Search Input with Clear Button */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={lang === 'en' ? 'Search members by name or ID...' : 'नाम या ID से सदस्य खोजें...'}
            className="pl-9 pr-8 h-9 text-xs font-medium rounded-xl shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs using Shadcn Tabs component */}
        <Tabs defaultValue="ALL" value={filterMode} onValueChange={setFilterMode} className="w-full">
          <TabsList className="w-full grid grid-cols-4 p-1 h-8 bg-muted/60 rounded-xl">
            <TabsTrigger value="ALL" className="text-[10px] font-bold py-1 px-1 rounded-lg">
              {lang === 'en' ? 'All' : 'सभी'}
            </TabsTrigger>
            <TabsTrigger value="GROUP" className="text-[10px] font-bold py-1 px-1 rounded-lg gap-1">
              <Users className="w-3 h-3" />
              <span>{lang === 'en' ? 'Forum' : 'मंच'}</span>
            </TabsTrigger>
            <TabsTrigger value="DIRECT" className="text-[10px] font-bold py-1 px-1 rounded-lg gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{lang === 'en' ? 'Direct' : 'निजी'}</span>
            </TabsTrigger>
            <TabsTrigger value="ONLINE" className="text-[10px] font-bold py-1 px-1 rounded-lg gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{onlineCount}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2. Channels & Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
        {/* GROUP CHANNEL */}
        {(filterMode === 'ALL' || filterMode === 'GROUP') && (
          <button
            onClick={onSelectGroup}
            className={`w-full p-3.5 text-left flex items-center justify-between transition cursor-pointer group ${
              activeTab === 'group'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-l-4 border-emerald-600 dark:border-emerald-400 shadow-2xs'
                : 'hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-950 text-emerald-200 flex items-center justify-center font-black shadow-md border border-emerald-400/30">
                  <Users className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {lang === 'en' ? 'Village Forum' : 'ग्रामोदय समूह मंच'}
                  </span>
                  <Badge variant="emerald" className="text-[9px] px-1.5 py-0">
                    {lang === 'en' ? 'Community' : 'सामुदायिक'}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">
                  {lang === 'en' ? 'Open discussion for village members' : 'ग्राम विकास संवाद एवं विचार विमर्श'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* ADMIN HELPDESK CHANNEL */}
        {(filterMode === 'ALL' || filterMode === 'DIRECT') && (
          <button
            onClick={onSelectAdmin}
            className={`w-full p-3.5 text-left flex items-center justify-between transition cursor-pointer group ${
              activeTab === 'admin'
                ? 'bg-blue-500/10 dark:bg-blue-950/40 border-l-4 border-blue-600 dark:border-blue-400 shadow-2xs'
                : 'hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex items-center justify-center font-bold flex-shrink-0 border border-blue-400/30 shadow-md">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {lang === 'en' ? 'Admin Helpdesk' : 'ग्रामोदय एडमिन हेल्पलाइन'}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800">
                    {lang === 'en' ? 'Official' : 'आधिकारिक'}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">
                  {lang === 'en' ? 'Direct support from village committee' : 'समिति नेतृत्व से सीधा व गोपनीय संवाद'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
          </button>
        )}

        {/* SECTION HEADER */}
        <div className="px-3.5 py-2 bg-muted/40 text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>{lang === 'en' ? 'Verified Members Directory' : 'सत्यापित सदस्य डायरेक्टरी'}</span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
            {displayedMembers.length}
          </Badge>
        </div>

        {/* DIRECT MEMBERS */}
        {displayedMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground font-medium space-y-1">
            <p>{lang === 'en' ? 'No members found' : 'कोई सदस्य नहीं मिला'}</p>
            <p className="text-[10px] text-muted-foreground/80">{lang === 'en' ? 'Try searching by name or number' : 'नाम या मोबाइल से खोजें'}</p>
          </div>
        ) : (
          displayedMembers.map((m, idx) => {
            const isSelected = activeTab === 'personal' && activePartner?.id === m.id;
            const online = isUserOnline(m.mobile);
            const memberId = `GYM-${String(idx + 1).padStart(6, '0')}`;

            return (
              <button
                key={m.id}
                onClick={() => onSelectMember(m)}
                className={`w-full p-3 text-left flex items-center justify-between transition cursor-pointer group ${
                  isSelected
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-l-4 border-emerald-600 dark:border-emerald-400 shadow-2xs'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Member Avatar using Shadcn Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10 border border-border shadow-xs">
                      {m.photoUrl ? (
                        <AvatarImage src={m.photoUrl} alt={m.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="font-bold text-xs bg-muted text-foreground">
                        {m.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Online Dot */}
                    {online ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-muted-foreground border-2 border-background"></span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {m.name}
                      </span>
                      <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 shadow-none font-bold">
                        {memberId}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        +91 {m.mobile.replace(/\D/g, '').slice(-10)}
                      </span>
                      {online ? (
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                          • {lang === 'en' ? 'Active' : 'सक्रिय'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">
                          • {m.villageName || m.gramPanchayat || (lang === 'en' ? 'Member' : 'सदस्य')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
