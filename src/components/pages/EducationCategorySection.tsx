'use client';

/**
 * /education/[slug] — one category and every scheme in it, served by
 * GET /api/education/categories/[slug].
 *
 * The API carries far more per scheme than the landing page shows (eligibility,
 * benefits, how to apply, documents, apply-here links), so this page renders
 * those when present and lets a student send an enquiry about a specific
 * scheme via POST /api/education/enquiries.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  FileCheck2,
  Gift,
  ListChecks,
  CalendarClock,
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';
import { DynamicIcon } from '../common';
import { EducationEnquiryModal } from '../modals/EducationEnquiryModal';
import {
  categoryName,
  categoryOverview,
  fetchEducationCategory,
  resourceDescription,
  resourceTitle,
} from '@/src/lib/education/client';
import type { EducationCategory, EducationResource } from '@/src/types';

/** One labelled block of scheme detail — rendered only when it has content. */
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">{icon}</span>
      <p className="text-[11px] text-[#6B6554] dark:text-slate-300 leading-relaxed">
        <span className="font-bold text-[#2C3327] dark:text-white">{label}: </span>
        {value}
      </p>
    </div>
  );
};

const SchemeCard: React.FC<{
  item: EducationResource;
  onAsk: (item: EducationResource) => void;
}> = ({ item, onAsk }) => {
  const { t, lang } = useApp();
  const documents = item.documentsRequired || [];
  const links = item.links || [];

  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
          <DynamicIcon name={item.icon} className="size-5 text-white" />
        </div>

        <h3 className="min-w-0 text-xs sm:text-sm font-bold text-[#2C3327] dark:text-white line-clamp-2">
          {resourceTitle(t, lang, item)}
        </h3>
      </div>

      <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed">
        {resourceDescription(t, lang, item)}
      </p>

      {(item.eligibility || item.benefits || item.howToApply || documents.length > 0) && (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#EFEBE2] dark:border-slate-800/80">
          <DetailRow
            icon={<FileCheck2 className="w-3.5 h-3.5" />}
            label={t('education.detail.eligibility')}
            value={item.eligibility}
          />
          <DetailRow
            icon={<Gift className="w-3.5 h-3.5" />}
            label={t('education.detail.benefits')}
            value={item.benefits}
          />
          <DetailRow
            icon={<ListChecks className="w-3.5 h-3.5" />}
            label={t('education.detail.howToApply')}
            value={item.howToApply}
          />
          <DetailRow
            icon={<FileCheck2 className="w-3.5 h-3.5" />}
            label={t('education.detail.documents')}
            value={documents.length > 0 ? documents.join(', ') : undefined}
          />
          {item.endDate && (
            <DetailRow
              icon={<CalendarClock className="w-3.5 h-3.5" />}
              label={t('education.detail.lastDate')}
              value={new Date(item.endDate).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN')}
            />
          )}
        </div>
      )}

      {(links.length > 0 || item.externalUrl) && (
        <div className="flex flex-wrap gap-1.5">
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition"
            >
              <ExternalLink className="w-3 h-3" />
              {t('education.detail.officialSite')}
            </a>
          )}
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#6B6554] dark:text-slate-300 bg-[#F2EFE8] dark:bg-slate-800/70 hover:bg-[#E8E4DA] dark:hover:bg-slate-800 transition"
            >
              <ExternalLink className="w-3 h-3" />
              {lang === 'en' ? link.label : link.labelHindi || link.label}
            </a>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onAsk(item)}
        className="w-full mt-auto rounded-xl font-bold text-[11px] cursor-pointer"
      >
        <span>{t('common.learnMore')}</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </Card>
  );
};

const SchemeGroup: React.FC<{
  title: string;
  items: EducationResource[];
  emptyLabel?: string;
  onAsk: (item: EducationResource) => void;
}> = ({ title, items, emptyLabel, onAsk }) => (
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
          <SchemeCard key={item.id} item={item} onAsk={onAsk} />
        ))}
      </div>
    )}
  </section>
);

export const EducationCategorySection: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, lang } = useApp();

  const [category, setCategory] = useState<EducationCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [enquiryFor, setEnquiryFor] = useState<EducationResource | null>(null);

  const load = useCallback(
    async (isStale?: () => boolean) => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const result = await fetchEducationCategory(slug);
        if (isStale?.()) return;
        if (result) {
          setCategory(result);
        } else {
          setNotFound(true);
        }
      } catch (err: any) {
        if (isStale?.()) return;
        setError(err?.message || 'Request failed');
      } finally {
        if (!isStale?.()) setLoading(false);
      }
    },
    [slug]
  );

  // A response for an old slug is ignored rather than aborted on cleanup:
  // aborting made StrictMode's second mount issue a duplicate request.
  useEffect(() => {
    let stale = false;
    load(() => stale);
    return () => {
      stale = true;
    };
  }, [load]);

  const backLink = (
    <Link
      href="/education"
      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-5 hover:underline"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{t('education.title')}</span>
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        {backLink}
        <div className="h-10 w-72 rounded-xl bg-[#EFEBE2] dark:bg-slate-800/70 animate-pulse mb-4" />
        <div className="h-16 w-full rounded-xl bg-[#F7F5F0] dark:bg-slate-900/60 animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((cell) => (
            <div
              key={cell}
              className="h-44 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-[#E0DCCF] dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        {backLink}
        <Card className="p-8 sm:p-10 text-center rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/5">
          <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white mb-1">
            {t('education.loadError')}
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-400 font-mono max-w-xl mx-auto break-words">
            {error}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => load()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            {t('education.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  if (notFound || !category) {
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

  const items = category.resources || [];
  const gramodayaItems = items.filter((i) => i.scope === 'gramodaya');
  const governmentItems = items.filter((i) => i.scope !== 'gramodaya');

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      {backLink}

      {/* ── Title + overview ── */}
      <div className="w-full flex items-center gap-3 sm:gap-4 mb-3">
        <div className="inline-flex items-center justify-center size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 shrink-0">
          <DynamicIcon
            name={category.icon}
            fallbackIcon="GraduationCap"
            className="size-6 sm:size-8 text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <h1 className="min-w-0 text-xl sm:text-3xl font-black text-[#2C3327] dark:text-white leading-tight">
          {categoryName(t, lang, category)}
        </h1>
      </div>

      <p className="w-full mb-8 text-sm sm:text-base text-[#6B6554] dark:text-slate-300 leading-relaxed">
        {categoryOverview(t, lang, category)}
      </p>

      {/* ── Gramodaya's own schemes, then government schemes ── */}
      <div className="w-full flex flex-col gap-6">
        <SchemeGroup
          title={t('common.gramodayaSchemes')}
          items={gramodayaItems}
          emptyLabel={t('common.noGramodayaSchemes')}
          onAsk={setEnquiryFor}
        />
        <SchemeGroup
          title={t('common.governmentSchemes')}
          items={governmentItems}
          onAsk={setEnquiryFor}
        />
      </div>

      <EducationEnquiryModal
        isOpen={Boolean(enquiryFor)}
        onClose={() => setEnquiryFor(null)}
        resourceId={enquiryFor?.id}
        resourceTitle={enquiryFor ? resourceTitle(t, lang, enquiryFor) : undefined}
        categoryId={category.id}
      />
    </div>
  );
};
