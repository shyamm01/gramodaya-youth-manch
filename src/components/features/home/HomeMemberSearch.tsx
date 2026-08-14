'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Phone, MessageSquare, X, Users, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Input } from '../../ui';
import { WhatsAppIcon } from '../../common';
import { Member } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface HomeMemberSearchProps {
  members: Member[];
  activeMembersCount: number;
}

export const HomeMemberSearch: React.FC<HomeMemberSearchProps> = ({
  members,
  activeMembersCount,
}) => {
  const { t } = useApp();
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const filteredSearchMembers = memberSearchQuery.trim()
    ? members.filter(
        (m) =>
          m.status === 'active' &&
          (m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
            m.mobile.includes(memberSearchQuery.trim()))
      )
    : [];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <Card className="rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                  {t('common.search')}
                </CardTitle>
                <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
                  {t('home.memberSearchSubtitle')}
                </span>
              </div>
            </div>

            <Link
              href="/members"
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <span>{t('nav.members')} ({activeMembersCount})</span>
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-[#8C8675] dark:text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <Input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border-[#E0DCCF] dark:border-slate-800 bg-[#FBF9F5] dark:bg-[#0B0F17] focus:bg-white dark:focus:bg-[#0D131F] transition-all"
            />
            {memberSearchQuery && (
              <button
                type="button"
                onClick={() => setMemberSearchQuery('')}
                className="absolute right-3 top-3 text-[#8C8675] hover:text-[#2C3327] dark:hover:text-white p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Area */}
          {memberSearchQuery.trim() !== '' && (
            <div className="mt-4 pt-3.5 border-t border-[#E0DCCF]/60 dark:border-slate-800">
              {filteredSearchMembers.length === 0 ? (
                <div className="text-center py-6 px-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200/60 dark:border-red-900/40">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {t('home.noMemberFound', { query: memberSearchQuery })}
                  </p>
                  <p className="text-[10px] text-red-500/80 dark:text-red-400/70 mt-1">
                    {t('home.noMemberFoundSub')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredSearchMembers.map((m) => {
                    const cleanDigits = m.mobile.replace(/\D/g, '').slice(-10);
                    return (
                      <div
                        key={m.id}
                        className="bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] p-3 rounded-xl border border-[#E0DCCF]/80 dark:border-slate-800 flex items-center justify-between gap-2.5 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-300/60 dark:border-emerald-800">
                            {m.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2C3327] dark:text-white truncate">
                              {m.name}
                            </p>
                            <p className="text-[10px] font-mono text-[#8C8675] dark:text-slate-400">
                              +91 {cleanDigits}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={`tel:+91${cleanDigits}`}
                            className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-transform duration-200 active:scale-95 cursor-pointer shadow-xs"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/91${cleanDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-transform duration-200 active:scale-95 cursor-pointer shadow-xs"
                            title="WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

