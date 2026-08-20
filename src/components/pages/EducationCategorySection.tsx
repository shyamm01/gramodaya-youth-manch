'use client';

import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';
import { CATEGORIES, type CategoryItem } from './EducationSection';

const SchemeCard: React.FC<{ item: CategoryItem }> = ({ item }) => {
  const { t } = useApp();
  const ItemIcon = item.icon;

  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-3 h-full">
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
};

const SchemeGroup: React.FC<{ title: string; items: CategoryItem[]; emptyLabel?: string }> = ({
  title,
  items,
  emptyLabel,
}) => (
  <section className="w-full flex flex-col gap-3">
    <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white px-1">
      {title}
    </h2>

    {items.length === 0 ? (
      <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 px-4 py-6 text-center rounded-xl border border-dashed border-[#E0DCCF] dark:border-slate-800/80 bg-[#FBF9F5] dark:bg-[#0B0F17]/60">
        {emptyLabel}
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <SchemeCard key={item.titleKey} item={item} />
        ))}
      </div>
    )}
  </section>
);

export const EducationCategorySection: React.FC<{ slug: string }> = ({ slug }) => {
  const { t } = useApp();
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="py-16 px-4 text-center space-y-4">
        <p className="text-sm text-[#8C8675] dark:text-slate-400">{t('common.notFound')}</p>
        <Link
          href="/education"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('education.title')}</span>
        </Link>
      </div>
    );
  }

  const CategoryIcon = category.icon;
  // Items carry no scope unless they are the Manch's own programmes, so
  // everything else falls through to the government group.
  const gramodayaItems = category.items.filter((i) => i.scope === 'gramodaya');
  const governmentItems = category.items.filter((i) => i.scope !== 'gramodaya');

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <Link
        href="/education"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-5 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('education.title')}</span>
      </Link>

      {/* ── Title + overview ── */}
      <div className="w-full flex items-center gap-3 sm:gap-4 mb-3">
        <div className="inline-flex items-center justify-center size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 shrink-0">
          <CategoryIcon className="size-6 sm:size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="min-w-0 text-xl sm:text-3xl font-black text-[#2C3327] dark:text-white leading-tight">
          {t(category.headingKey)}
        </h1>
      </div>

      <p className="max-w-3xl mb-8 text-sm sm:text-base text-[#6B6554] dark:text-slate-300 leading-relaxed">
        {t(category.overviewKey)}
      </p>

      {/* ── Gramodaya's own schemes, then government schemes ── */}
      <div className="w-full flex flex-col gap-6">
        <SchemeGroup
          title={t('common.gramodayaSchemes')}
          items={gramodayaItems}
          emptyLabel={t('common.noGramodayaSchemes')}
        />
        <SchemeGroup title={t('common.governmentSchemes')} items={governmentItems} />
      </div>
    </div>
  );
};
