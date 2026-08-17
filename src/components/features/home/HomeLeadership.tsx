'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, PhoneCall, MessageSquare, ArrowRight, Shield } from 'lucide-react';
import { Card, Avatar, AvatarImage, AvatarFallback, Badge } from '../../ui';
import { WhatsAppIcon } from '../../common';
import { Admin } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface HomeLeadershipProps {
  admins: Admin[];
}

export const HomeLeadership: React.FC<HomeLeadershipProps> = ({ admins }) => {
  const { t } = useApp();

  if (!admins || admins.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
              {t('nav.leadership')} ({t('home.leadershipTitle')})
            </h3>
            <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
              {t('home.leadershipSubtitle')}
            </span>
          </div>
        </div>

        <Link
          href="/leadership"
          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <span>{t('common.all')}</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {admins.slice(0, 4).map((admin) => {
          const cleanDigits = admin.mobile.replace(/\D/g, '').slice(-10);
          return (
            <Card
              key={admin.id}
              className="p-3.5 sm:p-4 text-center flex flex-col items-center justify-between rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center w-full">
                <div className="relative mb-3">
                  <Avatar size="lg" className="w-16 h-16 ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {admin.photoUrl ? (
                      <AvatarImage src={admin.photoUrl} alt={admin.name} />
                    ) : null}
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-base">
                      {admin.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 p-1 bg-emerald-700 text-white rounded-full ring-2 ring-white dark:ring-[#111726]">
                    <Shield className="w-2.5 h-2.5" />
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#2C3327] dark:text-white truncate max-w-full group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {admin.name}
                </h4>

                <Badge variant="success" className="mt-1 rounded-md truncate max-w-full">
                  {admin.role}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#E0DCCF]/60 dark:border-slate-800 w-full justify-center">
                <a
                  href={`tel:+91${cleanDigits}`}
                  className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-transform duration-200 active:scale-95 cursor-pointer shadow-xs"
                  title={t('common.call')}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://wa.me/91${cleanDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-transform duration-200 active:scale-95 cursor-pointer shadow-xs"
                  title={t('common.whatsapp')}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

