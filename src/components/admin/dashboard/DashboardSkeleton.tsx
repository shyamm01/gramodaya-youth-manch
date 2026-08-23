'use client';

import React from 'react';
import { Skeleton } from '@/src/components/ui/skeleton';
import {
  SkeletonChart,
  SkeletonMetricCards,
  SkeletonTable,
  adminCardClass,
} from '../section-ui';

/**
 * Placeholder for the executive dashboard.
 *
 * The dashboard is the tallest screen in the panel — four KPI tiles, two charts,
 * the triage table and the helpdesk banner. Standing in for it with a card grid
 * meant the page grew by roughly a screen height the moment data arrived.
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    <SkeletonMetricCards count={4} />

    {/* Member trend, then the activity chart with its segmented control. */}
    <SkeletonChart height="h-64" />
    <SkeletonChart height="h-72" />

    {/* Recent grievances pending action. */}
    <div className={`${adminCardClass} p-6 space-y-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-2.5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <SkeletonTable columns={5} rows={5} />
    </div>

    {/* Helpdesk callout banner. */}
    <div className="rounded-2xl p-5 sm:p-6 bg-slate-200/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-2.5 w-80 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-48 rounded-xl shrink-0" />
    </div>
  </div>
);
