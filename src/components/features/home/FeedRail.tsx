'use client';

import React from 'react';
import { Skeleton } from '../../ui';

/** How many items each home feed previews before the user has to tap "All". */
export const FEED_LIMIT = 5;

/**
 * One rail item's width: a fixed card that scrolls on narrow screens, and from
 * `lg` up exactly a fifth of the rail (minus the four 0.625rem gaps) so all
 * FEED_LIMIT items fit across the full-width section without scrolling.
 */
export const RAIL_ITEM_WIDTH = 'w-[190px] sm:w-[210px] lg:w-[calc((100%_-_2.5rem)/5)]';

/**
 * Horizontal, snap-scrolling rail. The negative margins let cards bleed to the
 * edge of the parent Card's padding so a partially visible card hints that the
 * rail scrolls.
 */
export const FeedRail: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-stretch gap-2.5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory -mx-4 sm:-mx-5 px-4 sm:px-5 pb-2 -mb-2">
    {children}
  </div>
);

/** Shared look for one item card inside a rail. */
export const RAIL_CARD =
  `snap-start shrink-0 ${RAIL_ITEM_WIDTH} flex flex-col p-3 bg-[#F8F6F0] dark:bg-[#0B0F17] hover:bg-[#F2EFE8] dark:hover:bg-[#0F1522] rounded-xl border border-[#E0DCCF]/70 dark:border-slate-800 transition-colors`;

export const RailSkeleton: React.FC = () => (
  <FeedRail>
    {[0, 1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className={`shrink-0 ${RAIL_ITEM_WIDTH} h-24 rounded-xl`} />
    ))}
  </FeedRail>
);

/**
 * Empty state. Inline icon + text on phones — the stacked, tall version turned
 * an empty section into most of a screen; it stacks again from `sm` up where
 * there's room for it to breathe.
 */
export const EmptyFeed: React.FC<{ icon: React.ElementType; label: string }> = ({
  icon: Icon,
  label,
}) => (
  <div className="flex sm:block items-center gap-2.5 text-left sm:text-center py-3 sm:py-8 px-3 sm:px-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0B0F17]/60 border border-dashed border-[#E0DCCF] dark:border-slate-800/80">
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 sm:mx-auto text-[#A59F8E] dark:text-slate-600 sm:mb-1.5 opacity-60" />
    <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 font-medium">{label}</p>
  </div>
);
