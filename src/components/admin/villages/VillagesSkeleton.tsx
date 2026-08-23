'use client';

import React from 'react';
import {
  SkeletonSectionHeader,
  SkeletonCardGrid,
} from '../section-ui';

/**
 * Placeholder for the village unit cards.
 *
 * Lives beside the section it mirrors so the two are edited together. The
 * `Body` export is what the section shows while its query is in flight — the
 * real header and filters are already on screen by then. The full export is
 * what the route's loading.tsx shows, when nothing is on screen yet.
 */
export const VillagesBodySkeleton: React.FC = () => (
  <SkeletonCardGrid columns="grid-cols-1 md:grid-cols-3" rows={6} lines={1} avatar />
);

export const VillagesSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <SkeletonSectionHeader />

    <VillagesBodySkeleton />
  </div>
);
