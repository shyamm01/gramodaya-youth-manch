'use client';

import React from 'react';
import { Skeleton } from '../../ui';

const FeedCardSkeleton: React.FC = () => (
  <div className="p-4 sm:p-5 rounded-2xl border border-[#E0DCCF]/80 dark:border-slate-800/80 bg-white dark:bg-[#111726]">
    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E0DCCF]/60 dark:border-slate-800">
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
    <div className="space-y-2.5">
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  </div>
);

export const HomeSkeleton: React.FC = () => (
  <div
    className="min-h-dvh space-y-8 sm:space-y-12 pb-24 md:pb-16"
    aria-busy="true"
    aria-live="polite"
  >
    {/* Hero skeleton — sized to match the real hero (badge, title, description,
        stat tiles, CTAs) so the real content doesn't cause a height jump. */}
    <section className="w-full flex flex-col items-center py-16 sm:py-20 lg:py-24 px-4 bg-[#0B130E] dark:bg-[#070B12] space-y-6 sm:space-y-8">
      <Skeleton className="h-7 w-56 rounded-full bg-white/10" />

      <div className="max-w-2xl w-full space-y-3.5 flex flex-col items-center">
        <Skeleton className="h-8 sm:h-10 w-4/5 bg-white/10" />
        <Skeleton className="h-4 w-3/5 bg-white/10" />
      </div>

      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 p-2 sm:p-3 bg-white/5 rounded-2xl border border-white/10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5">
            <Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-10 bg-white/10" />
              <Skeleton className="h-2.5 w-14 bg-white/10" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3.5">
        <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
        <Skeleton className="h-12 w-40 rounded-2xl bg-white/10" />
      </div>
    </section>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);
