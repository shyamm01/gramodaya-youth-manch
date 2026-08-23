'use client';

import React from 'react';
import { Skeleton } from '@/src/components/ui/skeleton';
import { SkeletonFormPanel, adminCardClass } from '../section-ui';

/**
 * Placeholder for the settings screen.
 *
 * Settings is not a list, so none of the record skeletons fit it: it is a
 * plain heading, the organization profile form, the storage panel and the
 * factory-reset panel, inside a max-w-4xl column.
 */
export const SettingsSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in max-w-4xl">
    <div className="space-y-2">
      <Skeleton className="h-5 w-72 max-w-full" />
      <Skeleton className="h-3 w-96 max-w-full" />
    </div>

    {/* Organization profile: four labelled fields over a save button. */}
    <SkeletonFormPanel fields={4} />

    {/* Storage engine panel. */}
    <div className={`${adminCardClass} p-6 space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-2.5 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-44 rounded-xl self-start sm:self-auto" />
      </div>
      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272a] space-y-2">
        <Skeleton className="h-2.5 w-52" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-4/5" />
      </div>
    </div>

    {/* Factory reset panel — its own rose-tinted frame. */}
    <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-3.5 w-52" />
      <Skeleton className="h-2.5 w-full max-w-lg" />
      <Skeleton className="h-9 w-64 rounded-xl" />
    </div>
  </div>
);
