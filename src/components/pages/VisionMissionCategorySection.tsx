'use client';

import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';
import { CATEGORIES } from './VisionMissionSection';

export const VisionMissionCategorySection: React.FC<{ slug: string }> = ({ slug }) => {
  const { t } = useApp();
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="py-16 px-4 text-center space-y-4">
        <p className="text-sm text-[#8C8675] dark:text-slate-400">{t('common.notFound')}</p>
        <Link
          href="/vision-mission"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('visionMission.title')}</span>
        </Link>
      </div>
    );
  }

  const CategoryIcon = category.icon;

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <Link
        href="/vision-mission"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-5 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('visionMission.title')}</span>
      </Link>

      <div className="relative w-full flex items-start justify-start mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 shrink-0">
          <CategoryIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="w-full flex flex-col items-start justify-start ml-4">
          <h1 className="text-2xl sm:text-4xl font-black text-[#2C3327] dark:text-white">
            {t(category.headingKey)}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {category.items.map((item) => {
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

              <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed">
                {t(item.descKey)}
              </p>

              <Link href="/social-work" className="w-full mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl font-bold text-[11px] cursor-pointer"
                >
                  <span>{t('common.getInvolved')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
