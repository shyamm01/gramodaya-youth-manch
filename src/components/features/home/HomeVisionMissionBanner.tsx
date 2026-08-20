'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Eye, Target, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../ui';
import { CATEGORIES } from '../../pages/VisionMissionSection';

export const HomeVisionMissionBanner: React.FC = () => {
  const { t } = useApp();

  return (
    <section className="max-w-5xl mx-auto">
      {/* Section header — same pattern as the other home sections */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
              {t('visionMission.title')}
            </h3>
            <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium line-clamp-2 sm:line-clamp-1">
              {t('visionMission.subtitle')}
            </span>
          </div>
        </div>

        <Link
          href="/vision-mission"
          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex-shrink-0"
        >
          <span>{t('common.all')}</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Vision & Mission statements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </span>
            <h4 className="text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
              {t('visionMission.visionTitle')}
            </h4>
          </div>
          <p className="text-xs text-[#6B6554] dark:text-slate-300 leading-relaxed">
            {t('visionMission.visionText')}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </span>
            <h4 className="text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
              {t('visionMission.missionTitle')}
            </h4>
          </div>
          <p className="text-xs text-[#6B6554] dark:text-slate-300 leading-relaxed">
            {t('visionMission.missionText')}
          </p>
        </Card>
      </div>

      {/* Focus areas — one tile per category, links into the dedicated page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-3 sm:mt-4">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.slug}
              href={`/vision-mission/${category.slug}`}
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 group/tile"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover/tile:scale-105 transition-transform duration-300">
                <Icon className="w-4 h-4 text-white" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#2C3327] dark:text-white leading-snug group-hover/tile:text-emerald-700 dark:group-hover/tile:text-emerald-400 transition-colors">
                {t(category.headingKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
