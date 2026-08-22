'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, MapPin } from 'lucide-react';
import { Card, Badge, Skeleton } from '../../ui';
import { StatusBadge } from '../../common';
import { Complaint } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { FEED_LIMIT, RAIL_CARD, FeedRail, RailSkeleton, EmptyFeed } from './FeedRail';
import { getCategoryLabel } from '../grievance';

interface HomeGrievanceBannerProps {
  /** Server-computed count (SQL count(), not derived from a truncated list). */
  newComplaintsCount: number;
  resolvedComplaintsCount: number;
  loading?: boolean;
  /** Latest complaints, newest first — already limited by the API. */
  complaints?: Complaint[] | any[];
  complaintsLoading?: boolean;
}

const GrievanceRailItem: React.FC<{
  complaint: any;
  lang: string;
  locale: string;
  idx: number;
}> = ({ complaint: c, lang, locale, idx }) => {
  const displayTitle = lang === 'hi' ? (c.titleHindi || c.title) : (c.title || c.titleHindi);
  const displayLocation = lang === 'hi' ? (c.locationHindi || c.location) : (c.location || c.locationHindi);

  return (
    <Link
      href={`/problems/${c.id}`}
      className={RAIL_CARD}
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <StatusBadge status={c.status} size="xs" lang={lang} />
        {c.createdAt && (
          <span className="text-[9px] text-[#8C8675] dark:text-slate-500 font-mono flex-shrink-0">
            {new Date(c.createdAt).toLocaleDateString(locale, {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>
      <h4 className="text-xs font-bold text-[#2C3327] dark:text-white line-clamp-2 leading-snug">
        {displayTitle}
      </h4>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {c.category && (
          <Badge variant="secondary" className="text-[9px] rounded-md font-semibold">
            {getCategoryLabel(c.category, lang)}
          </Badge>
        )}
      </div>
      {c.location && (
        <span className="text-[10px] text-[#8C8675] dark:text-slate-400 flex items-center gap-0.5 mt-1.5">
          <MapPin className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="truncate">{displayLocation}</span>
        </span>
      )}
    </Link>
  );
};

export const HomeGrievanceBanner: React.FC<HomeGrievanceBannerProps> = ({
  newComplaintsCount,
  resolvedComplaintsCount,
  loading = false,
  complaints = [],
  complaintsLoading = false,
}) => {
  const { t, lang } = useApp();
  const locale = lang === 'en' ? 'en-IN' : 'hi-IN';

  return (
    <section className="max-w-5xl mx-auto">
      <Card className="min-w-0 overflow-hidden p-4 sm:p-5 rounded-2xl border border-amber-400/40 dark:border-amber-700/40 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 dark:to-[#111726] shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-amber-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
              {newComplaintsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#111726] animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#2C3327] dark:text-white tracking-tight">
                {t('home.grievanceTitle')}
              </h3>
              <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium line-clamp-2 sm:line-clamp-1">
                {t('home.grievanceSubtitle')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              {loading ? (
                <>
                  <Skeleton className="h-5 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-16 rounded-lg" />
                </>
              ) : (
                <>
                  {newComplaintsCount > 0 && (
                    <Badge variant="warning" className="gap-1 rounded-lg">
                      <FileText className="w-3 h-3" />
                      {newComplaintsCount} {t('common.new')}
                    </Badge>
                  )}
                  <Badge variant="success" className="gap-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    {resolvedComplaintsCount} {t('common.resolved')}
                  </Badge>
                </>
              )}
            </div>

            <Link
              href="/problems"
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 group/btn px-2.5 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
            >
              <span>{t('common.all')}</span>
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Counts stay visible on mobile, where the header has no room for them */}
        {!loading && (
          <div className="flex sm:hidden items-center gap-2 mb-3">
            {newComplaintsCount > 0 && (
              <Badge variant="warning" className="gap-1 rounded-lg">
                <FileText className="w-3 h-3" />
                {newComplaintsCount} {t('common.new')}
              </Badge>
            )}
            <Badge variant="success" className="gap-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3" />
              {resolvedComplaintsCount} {t('common.resolved')}
            </Badge>
          </div>
        )}

        {complaintsLoading ? (
          <RailSkeleton />
        ) : complaints.length === 0 ? (
          <EmptyFeed icon={AlertTriangle} label={t('home.noGrievances')} />
        ) : (
          <FeedRail>
            {complaints.slice(0, FEED_LIMIT).map((c: any, idx: number) => (
              <GrievanceRailItem
                key={c.id}
                complaint={c}
                lang={lang}
                locale={locale}
                idx={idx}
              />
            ))}
          </FeedRail>
        )}
      </Card>
    </section>
  );
};
