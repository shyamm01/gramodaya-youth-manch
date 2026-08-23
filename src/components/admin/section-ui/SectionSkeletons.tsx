'use client';

import React from 'react';
import { Card } from '@/src/components/ui/card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { cn } from '@/src/lib/utils';
import { adminCardClass } from './tokens';

/**
 * The pieces an admin section's placeholder is built from.
 *
 * A skeleton is only worth having if it occupies the same space the real thing
 * will: the point is that nothing moves when the data lands. One generic
 * three-column card grid stood in for all eleven screens, so the gallery's
 * four-column tiles, the members table and the announcements list each jumped
 * into a different shape on arrival — the placeholder was causing the layout
 * shift it exists to prevent.
 *
 * These mirror the real containers, reusing the same grid and card classes the
 * sections use, so the two stay the same size by construction.
 */

/** Matches SectionHeader: identity on the left, refresh + primary action right. */
export const SkeletonSectionHeader: React.FC<{ withAction?: boolean }> = ({
  withAction = true,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="space-y-2">
      <Skeleton className="h-5 w-64 max-w-full" />
      <Skeleton className="h-3 w-96 max-w-full" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-24 rounded-xl" />
      {withAction && <Skeleton className="h-8 w-32 rounded-xl" />}
    </div>
  </div>
);

/**
 * Matches the filter row. `variant="panel"` is the `adminCardClass p-4 flex`
 * bar the record sections use; `variant="bar"` is the shadcn <FilterBar> Card
 * that gallery and elders use for a lone search box.
 */
export const SkeletonFilterBar: React.FC<{
  selects?: number;
  date?: boolean;
  variant?: 'panel' | 'bar';
}> = ({ selects = 0, date = false, variant = 'panel' }) => {
  const controls = (
    <>
      <Skeleton className="h-9 flex-1 min-w-[200px] rounded-xl" />
      {(selects > 0 || date) && (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: selects }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 rounded-xl" />
          ))}
          {date && <Skeleton className="h-9 w-40 rounded-xl" />}
        </div>
      )}
    </>
  );

  if (variant === 'bar') {
    return <Card className="p-3 flex flex-wrap items-center gap-2.5">{controls}</Card>;
  }

  return (
    <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>{controls}</div>
  );
};

/** Matches the members table: a header strip over evenly weighted rows. */
export const SkeletonTable: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 7,
  rows = 8,
}) => (
  <div className={`${adminCardClass} overflow-hidden`}>
    <div className="bg-slate-50 dark:bg-[#16161a] border-b border-slate-200 dark:border-[#222328] px-4 py-3 flex items-center gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={cn('h-2.5', i === 0 ? 'w-32' : 'flex-1 max-w-[90px]')} />
      ))}
    </div>
    <div className="divide-y divide-slate-100 dark:divide-[#1e1f24]">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3.5 flex items-center gap-4">
          <div className="flex items-center gap-3 w-32 shrink-0">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-3/5" />
            </div>
          </div>
          {Array.from({ length: columns - 3 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 flex-1 max-w-[90px]" />
          ))}
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Matches a grid of record cards. `columns` takes the section's own grid
 * classes so the two cannot disagree about how many fit on a row.
 */
export const SkeletonCardGrid: React.FC<{
  columns: string;
  rows?: number;
  /** Body text lines inside each card. */
  lines?: number;
  /** Leading avatar/icon disc, as elders and villages have. */
  avatar?: boolean;
}> = ({ columns, rows = 6, lines = 2, avatar = false }) => (
  <div className={cn('grid gap-4', columns)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`${adminCardClass} p-5 space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {avatar && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
            <div className="space-y-1.5 min-w-0 flex-1">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: lines }).map((_, l) => (
            <Skeleton key={l} className={cn('h-2.5', l === lines - 1 ? 'w-3/5' : 'w-full')} />
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between">
          <Skeleton className="h-2.5 w-28" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Matches the announcements list: full-width rows, actions on the right. */
export const SkeletonListRows: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`${adminCardClass} p-4 flex items-start justify-between gap-4`}
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-2.5 w-4/5" />
          <Skeleton className="h-2 w-32" />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/** Matches the gallery: an image plate with a caption strip under it. */
export const SkeletonTileGrid: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`${adminCardClass} overflow-hidden`}>
        <Skeleton className="h-32 w-full rounded-none" />
        <div className="p-3 space-y-1.5">
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/** Matches a settings panel: a titled card over a grid of labelled fields. */
export const SkeletonFormPanel: React.FC<{ fields?: number; withSubmit?: boolean }> = ({
  fields = 4,
  withSubmit = true,
}) => (
  <div className={`${adminCardClass} p-6 space-y-5`}>
    <Skeleton className="h-3.5 w-48" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-2 w-40" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
    {withSubmit && <Skeleton className="h-9 w-32 rounded-xl" />}
  </div>
);

/** Matches the four KPI tiles across the top of the dashboard. */
export const SkeletonMetricCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${adminCardClass} p-5 space-y-3`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-2.5 w-28" />
      </div>
    ))}
  </div>
);

/** Matches a chart panel: title block over the plot area. */
export const SkeletonChart: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={`${adminCardClass} p-6 space-y-4`}>
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-52" />
        <Skeleton className="h-2.5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-8 w-28 rounded-xl" />
    </div>
    <Skeleton className={cn('w-full rounded-2xl', height)} />
  </div>
);
