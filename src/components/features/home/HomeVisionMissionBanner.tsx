'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui';
import { CATEGORIES } from '../../pages/VisionMissionSection';

export const HomeVisionMissionBanner: React.FC = () => {
  const { t } = useApp();

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                {t('visionMission.title')}
              </h3>
              <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium">
                {t('visionMission.subtitle')}
              </span>
            </div>
          </div>

          <Link
            href="/vision-mission"
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          >
            <span>{t('common.all')}</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <p className="text-xs text-[#2C3327] dark:text-slate-300 leading-relaxed mb-4">
          {t('visionMission.missionText')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/vision-mission/${category.slug}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] border border-[#E0DCCF]/70 dark:border-slate-800 transition-colors group/chip"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-[#2C3327] dark:text-white truncate group-hover/chip:text-emerald-700 dark:group-hover/chip:text-emerald-400 transition-colors">
                  {t(category.headingKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>
    </section>
  );
};
