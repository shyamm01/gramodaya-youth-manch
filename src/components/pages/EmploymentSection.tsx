'use client';

import React from 'react';
import { Briefcase, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';

const EMPLOYMENT_CARDS = [
  { titleKey: 'employment.mgnrega.title', descKey: 'employment.mgnrega.desc' },
  { titleKey: 'employment.skill.title', descKey: 'employment.skill.desc' },
  { titleKey: 'employment.selfEmployment.title', descKey: 'employment.selfEmployment.desc' },
  { titleKey: 'employment.jobBoard.title', descKey: 'employment.jobBoard.desc' },
];

export const EmploymentSection: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="py-6 px-4 sm:px-6 max-w-5xl mx-auto space-y-6 transition-colors duration-200">
      <div className="bg-gradient-to-br from-[#18281E] via-[#24382B] to-[#1B3025] dark:from-[#0B1528] dark:via-[#0C1E19] dark:to-[#080C14] text-white rounded-3xl p-6 sm:p-10 border border-[#3B4F3D] dark:border-slate-800 shadow-md text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/30">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span>{t('employment.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">{t('employment.title')}</h1>
        <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl mx-auto">
          {t('employment.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EMPLOYMENT_CARDS.map((card) => (
          <Card key={card.titleKey} className="p-5 sm:p-6 space-y-2">
            <h3 className="text-sm font-black text-[#2C3327] dark:text-white">
              {t(card.titleKey)}
            </h3>
            <p className="text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed">
              {t(card.descKey)}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Link href="/helpline">
          <Button variant="outline" size="default" className="px-5 py-2.5 rounded-xl font-bold cursor-pointer">
            <PhoneCall className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('employment.contactCta')}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
