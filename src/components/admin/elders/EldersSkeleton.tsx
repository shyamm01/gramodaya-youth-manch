'use client';

import React from 'react';
import {
  SkeletonSectionHeader,
  SkeletonFilterBar,
  SkeletonCardGrid,
} from '../section-ui';

/**
 * Placeholder for the elder honour cards.
 *
 * Lives beside the section it mirrors so the two are edited together. The
 * `Body` export is what the section shows while its query is in flight — the
 * real header and filters are already on screen by then. The full export is
 * what the route's loading.tsx shows, when nothing is on screen yet.
 */
export const EldersBodySkeleton: React.FC = () => (
  <SkeletonCardGrid columns="grid-cols-1 md:grid-cols-3" rows={6} lines={1} avatar />
);

export const EldersSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <SkeletonSectionHeader />
    <SkeletonFilterBar variant="bar" />
    <EldersBodySkeleton />
  </div>
);
