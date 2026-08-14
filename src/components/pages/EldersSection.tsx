'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShieldAlert, Phone, MessageSquare } from 'lucide-react';
import {
  Card,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui';
import { WhatsAppIcon } from '../common';

export const EldersSection: React.FC = () => {
  const { elders, villageSettings, t, lang } = useApp();

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto transition-colors duration-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F2EC] dark:bg-emerald-950/60 text-[#1E3A2F] dark:text-emerald-300 text-xs font-bold mb-3 border border-[#B3D6C2] dark:border-emerald-800">
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('elders.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2C3327] dark:text-white tracking-tight">
          {t('nav.elders')}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 max-w-2xl mx-auto font-medium">
          {t('header.village')} — <span className="font-bold text-emerald-700 dark:text-emerald-400">{lang === 'en' ? villageSettings.name : villageSettings.nameHindi}</span>, {t('header.gramPanchayat')} — <span className="font-bold text-emerald-700 dark:text-emerald-400">{lang === 'en' ? villageSettings.gramPanchayat : villageSettings.gramPanchayatHindi}</span>
        </p>
      </div>

      {elders.length === 0 ? (
        <Card className="p-12 text-center text-[#8C8675] dark:text-slate-400 my-4 max-w-2xl mx-auto shadow-2xs font-medium rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <ShieldAlert className="w-10 h-10 text-amber-600 dark:text-amber-400 mx-auto mb-3 opacity-60" />
          <p className="text-base font-bold text-[#2C3327] dark:text-white mb-1">
            {t('elders.noEldersTitle')}
          </p>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-2 max-w-md mx-auto">
            {t('elders.noEldersDesc')}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {elders.map((e) => {
            const cleanDigits = e.mobile ? e.mobile.replace(/\D/g, '').slice(-10) : '';
            return (
              <Card key={e.id} className="p-5 flex flex-col items-center text-center hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all rounded-2xl">
                <Avatar size="xl" className="border-2 border-emerald-600 dark:border-emerald-500 mb-3">
                  {e.photoUrl ? (
                    <AvatarImage src={e.photoUrl} alt={e.name} />
                  ) : null}
                  <AvatarFallback>
                    <Users className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-[#2C3327] dark:text-white text-base">{e.name}</h3>
                <Badge variant="secondary" className="mt-1 rounded-lg">
                  {e.location || (lang === 'en' ? (villageSettings.name || 'Rasoolpur') : villageSettings.nameHindi)}
                </Badge>
                {e.details && (
                  <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">{e.details}</p>
                )}
                {e.mobile && cleanDigits && (
                  <div className="mt-4 w-full grid grid-cols-2 gap-2 pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
                    <a
                      href={`tel:+91${cleanDigits}`}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-[#1E3A2F] hover:bg-[#142820] dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      <span>{t('common.call')}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${cleanDigits}?text=${encodeURIComponent(lang === 'en' ? 'Hello! Contacting from Gramodaya Youth Manch:' : 'जय हिंद! ग्रामोदय यूथ मंच:')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 mr-1" />
                      <span>{t('common.whatsapp')}</span>
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
