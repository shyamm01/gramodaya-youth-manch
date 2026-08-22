'use client';

/**
 * /education/[slug]/[resourceSlug] — the full page for one scheme, served by
 * GET /api/education/categories/[slug]/resources/[resourceSlug].
 *
 * The category page shows every scheme as a card and has to keep each one
 * short; this is where the same row is shown in full — eligibility, benefits,
 * how to apply, documents, dates, whom to contact and every link — so a card
 * can link somewhere real instead of only opening the enquiry form.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  FileCheck2,
  Gift,
  ListChecks,
  CalendarClock,
  CalendarPlus,
  Building2,
  Phone,
  MessageCircleQuestion,
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../ui';
import { DynamicIcon } from '../common';
import { EducationEnquiryModal } from '../modals/EducationEnquiryModal';
import {
  categoryName,
  fetchEducationResource,
  resourceBenefits,
  resourceDescription,
  resourceDocuments,
  resourceEligibility,
  resourceHowToApply,
  resourceProvider,
  resourceTitle,
} from '@/src/lib/education/client';
import type { EducationCategory, EducationResource } from '@/src/types';

/**
 * One block of scheme detail. Unlike the card version on the category page
 * this stacks the label above the text and does not truncate — the whole point
 * of the detail page is that nothing here is cut short.
 */
const DetailBlock: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-[#8C8675] dark:text-slate-400 mb-1">
          {label}
        </h3>
        <p className="text-xs sm:text-sm text-[#4A4636] dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {value}
        </p>
      </div>
    </div>
  );
};

export const EducationResourceSection: React.FC<{
  categorySlug: string;
  resourceSlug: string;
}> = ({ categorySlug, resourceSlug }) => {
  const { t, lang } = useApp();

  const [category, setCategory] = useState<EducationCategory | null>(null);
  const [resource, setResource] = useState<EducationResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  const load = useCallback(
    async (isStale?: () => boolean) => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const result = await fetchEducationResource(categorySlug, resourceSlug);
        if (isStale?.()) return;
        if (result) {
          setCategory(result.category);
          setResource(result.resource);
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
    [categorySlug, resourceSlug]
  );

  // Ignored rather than aborted on cleanup, so StrictMode's second mount reuses
  // the in-flight request instead of firing a duplicate one.
  useEffect(() => {
    let stale = false;
    load(() => stale);
    return () => {
      stale = true;
    };
  }, [load]);

  const backLink = (
    <Link
      href={`/education/${categorySlug}`}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-5 hover:underline"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{category ? categoryName(t, lang, category) : t('education.detail.backToCategory')}</span>
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        {backLink}
        <div className="flex items-center gap-4 mb-6">
          <div className="size-14 sm:size-16 rounded-2xl bg-[#EFEBE2] dark:bg-slate-800/70 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-6 w-2/3 rounded-xl bg-[#EFEBE2] dark:bg-slate-800/70 animate-pulse" />
            <div className="h-3 w-1/3 rounded-lg bg-[#F7F5F0] dark:bg-slate-900/60 animate-pulse" />
          </div>
        </div>
        <div className="h-24 w-full rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 animate-pulse mb-4" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-20 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-[#E0DCCF] dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
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

  // A withdrawn scheme is a normal thing for a visitor to land on from an old
  // link, so it gets an explanation and a way onward, not a bare "404".
  if (notFound || !resource) {
    return (
      <div className="max-w-4xl mx-auto">
        {backLink}
        <Card className="p-8 sm:p-10 text-center rounded-2xl">
          <p className="text-sm font-bold text-[#2C3327] dark:text-white mb-1">
            {t('education.detail.notFound')}
          </p>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-4">
            {t('education.detail.notFoundBody')}
          </p>
          <Link href={`/education/${categorySlug}`}>
            <Button variant="outline" size="sm">
              {t('education.detail.backToCategory')}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const documents = resourceDocuments(lang, resource);
  const eligibility = resourceEligibility(t, lang, resource);
  const benefits = resourceBenefits(t, lang, resource);
  const howToApply = resourceHowToApply(t, lang, resource);
  const provider = resourceProvider(t, lang, resource);
  const links = resource.links || [];
  const tags = resource.tags || [];
  const locale = lang === 'en' ? 'en-IN' : 'hi-IN';
  const formatDate = (value: string) => new Date(value).toLocaleDateString(locale);
  const contact = [resource.contactName, resource.contactMobile].filter(Boolean).join(' · ');

  // Admin-created rows often carry only a title and summary. An empty details
  // card looks broken, so the card appears only once something fills it.
  const hasDetails = Boolean(
    provider ||
      eligibility ||
      benefits ||
      howToApply ||
      documents.length > 0 ||
      resource.startDate ||
      resource.endDate ||
      contact
  );

  return (
    <div className="max-w-4xl mx-auto transition-colors duration-200">
      {backLink}

      {/* ── Heading ── */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="inline-flex items-center justify-center size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/10 shrink-0">
          <DynamicIcon name={resource.icon} fallbackIcon="BookOpen" className="size-7 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-black text-[#2C3327] dark:text-white leading-tight">
            {resourceTitle(t, lang, resource)}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
              {resource.scope === 'gramodaya' ? 'Gramodaya' : 'Government'}
            </span>
            {category && (
              <Link
                href={`/education/${category.slug}`}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#6B6554] dark:text-slate-300 bg-[#F2EFE8] dark:bg-slate-800/70 hover:bg-[#E8E4DA] dark:hover:bg-slate-800 transition"
              >
                {categoryName(t, lang, category)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      <p className="text-xs sm:text-sm text-[#6B6554] dark:text-slate-300 leading-relaxed mb-5">
        {resourceDescription(t, lang, resource)}
      </p>

      {/* ── Everything the row actually carries ── */}
      {hasDetails && (
        <Card className="p-5 sm:p-6 flex flex-col gap-5 mb-4">
          <DetailBlock
            icon={<Building2 className="w-4 h-4" />}
            label={t('education.detail.provider')}
            value={provider}
          />
          <DetailBlock
            icon={<FileCheck2 className="w-4 h-4" />}
            label={t('education.detail.eligibility')}
            value={eligibility}
          />
          <DetailBlock
            icon={<Gift className="w-4 h-4" />}
            label={t('education.detail.benefits')}
            value={benefits}
          />
          <DetailBlock
            icon={<ListChecks className="w-4 h-4" />}
            label={t('education.detail.howToApply')}
            value={howToApply}
          />
          <DetailBlock
            icon={<FileCheck2 className="w-4 h-4" />}
            label={t('education.detail.documents')}
            value={documents.length > 0 ? documents.map((d) => `• ${d}`).join('\n') : undefined}
          />
          <DetailBlock
            icon={<CalendarPlus className="w-4 h-4" />}
            label={t('education.detail.startDate')}
            value={resource.startDate ? formatDate(resource.startDate) : undefined}
          />
          <DetailBlock
            icon={<CalendarClock className="w-4 h-4" />}
            label={t('education.detail.lastDate')}
            value={resource.endDate ? formatDate(resource.endDate) : undefined}
          />
          <DetailBlock
            icon={<Phone className="w-4 h-4" />}
            label={t('education.detail.contact')}
            value={contact || undefined}
          />
        </Card>
      )}

      {/* ── Links out ── */}
      {(links.length > 0 || resource.externalUrl) && (
        <Card className="p-5 sm:p-6 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-[#8C8675] dark:text-slate-400 mb-3">
            {t('education.detail.links')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.externalUrl && (
              <a
                href={resource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('education.detail.officialSite')}
              </a>
            )}
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#6B6554] dark:text-slate-300 bg-[#F2EFE8] dark:bg-slate-800/70 hover:bg-[#E8E4DA] dark:hover:bg-slate-800 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {lang === 'en' ? link.label : link.labelHindi || link.label}
              </a>
            ))}
          </div>
        </Card>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4 px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8C8675] dark:text-slate-400">
            {t('education.detail.tags')}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#6B6554] dark:text-slate-300 bg-[#F2EFE8] dark:bg-slate-800/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Enquiry ── */}
      <Card className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#2C3327] dark:text-white mb-1">
            {t('education.detail.askTitle')}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed">
            {t('education.detail.askBody')}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAskOpen(true)}
          className="shrink-0 rounded-xl font-bold text-[11px] cursor-pointer"
        >
          <MessageCircleQuestion className="w-3.5 h-3.5 mr-1.5" />
          {t('education.detail.askCta')}
        </Button>
      </Card>

      <EducationEnquiryModal
        isOpen={askOpen}
        onClose={() => setAskOpen(false)}
        resourceId={resource.id}
        resourceTitle={resourceTitle(t, lang, resource)}
        categoryId={category?.id}
      />
    </div>
  );
};
