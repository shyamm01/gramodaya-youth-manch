'use client';

import React from 'react';
import {
  SkeletonSectionHeader,
  SkeletonListRows,
} from '../section-ui';

/**
 * Placeholder for the announcements list.
 *
 * Lives beside the section it mirrors so the two are edited together. The
 * `Body` export is what the section shows while its query is in flight — the
 * real header and filters are already on screen by then. The full export is
 * what the route's loading.tsx shows, when nothing is on screen yet.
 */
export const AnnouncementsBodySkeleton: React.FC = () => (
  <SkeletonListRows rows={5} />
);

export const AnnouncementsSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <SkeletonSectionHeader />

    <AnnouncementsBodySkeleton />
  </div>
);
