'use client';

import React from 'react';
import {
  Briefcase,
  PhoneCall,
  Landmark,
  Wrench,
  Store,
  ClipboardList,
  HardHat,
  Users,
  Search,
  Award,
  Zap,
  Banknote,
  TrendingUp,
  Hammer,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';

export const CATEGORIES = [
  {
    slug: 'schemes',
    headingKey: 'employment.cat.schemes',
    icon: Landmark,
    items: [
      { titleKey: 'employment.mgnrega.title', descKey: 'employment.mgnrega.desc', icon: HardHat },
      { titleKey: 'employment.dayNrlm.title', descKey: 'employment.dayNrlm.desc', icon: Users },
      { titleKey: 'employment.ncs.title', descKey: 'employment.ncs.desc', icon: Search },
    ],
  },
  {
    slug: 'skill-development',
    headingKey: 'employment.cat.skill',
    icon: Wrench,
    items: [
      { titleKey: 'employment.pmkvy.title', descKey: 'employment.pmkvy.desc', icon: Award },
      { titleKey: 'employment.iti.title', descKey: 'employment.iti.desc', icon: Wrench },
      { titleKey: 'employment.skillIndia.title', descKey: 'employment.skillIndia.desc', icon: Zap },
    ],
  },
  {
    slug: 'self-employment',
    headingKey: 'employment.cat.selfEmployment',
    icon: Store,
    items: [
      { titleKey: 'employment.mudra.title', descKey: 'employment.mudra.desc', icon: Banknote },
      { titleKey: 'employment.standUpIndia.title', descKey: 'employment.standUpIndia.desc', icon: TrendingUp },
      { titleKey: 'employment.pmVishwakarma.title', descKey: 'employment.pmVishwakarma.desc', icon: Hammer },
    ],
  },
  {
    slug: 'job-board',
    headingKey: 'employment.cat.jobBoard',
    icon: ClipboardList,
    items: [
      { titleKey: 'employment.localJobs.title', descKey: 'employment.localJobs.desc', icon: MapPin },
      { titleKey: 'employment.govtJobs.title', descKey: 'employment.govtJobs.desc', icon: Landmark },
      { titleKey: 'employment.helplineJobs.title', descKey: 'employment.helplineJobs.desc', icon: PhoneCall },
    ],
  },
];

const INITIAL_VISIBLE = 2;

export const EmploymentSection: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 transition-colors duration-200">
      <div className="relative overflow-hidden bg-[#0B130E] dark:bg-[#070B12] text-white rounded-3xl p-6 sm:p-12 border border-[#3B4F3D] dark:border-slate-800 shadow-md">
        {/* Decorative ambient glow */}
        <div className="absolute -top-10 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10">
            <Briefcase className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-sm">{t('employment.title')}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl mx-auto">
            {t('employment.subtitle')}
          </p>

          {/* Category overview chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div
                  key={category.headingKey}
                  className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl backdrop-blur-md transition-colors"
                >
                  <CategoryIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white/90">{t(category.headingKey)}</span>
                  <span className="text-[10px] font-black text-amber-300">{category.items.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {CATEGORIES.map((category) => {
        const CategoryIcon = category.icon;
        const visibleItems = category.items.slice(0, INITIAL_VISIBLE);

        return (
          <section key={category.headingKey} className="space-y-3">
            <div className="w-full flex justify-between items-center gap-2 px-1">
              <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white flex items-center gap-2 min-w-0 leading-snug">
                <CategoryIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t(category.headingKey)}</span>
              </h2>

              <Link
                href={`/employment/${category.slug}`}
                className="flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
              >
                <span>{t('common.showMore')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Card
                    key={item.titleKey}
                    className="p-4 sm:p-5 flex flex-col gap-3 h-full"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                        <ItemIcon className="size-5 text-white" />
                      </div>

                      <h3 className="min-w-0 text-xs sm:text-sm font-bold text-[#2C3327] dark:text-white line-clamp-2">
                        {t(item.titleKey)}
                      </h3>
                    </div>

                    <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed line-clamp-2">
                      {t(item.descKey)}
                    </p>

                    <Link href="/helpline" className="w-full mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl font-bold text-[11px] cursor-pointer"
                      >
                        <span>{t('common.learnMore')}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>

          </section>
        );
      })}
    </div>
  );
};
