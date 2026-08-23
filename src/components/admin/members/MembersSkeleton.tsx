'use client';

import React from 'react';
import {
  SkeletonSectionHeader,
  SkeletonFilterBar,
  SkeletonTable,
} from '../section-ui';

/**
 * Placeholder for the members directory table.
 *
 * Lives beside the section it mirrors so the two are edited together. The
 * `Body` export is what the section shows while its query is in flight — the
 * real header and filters are already on screen by then. The full export is
 * what the route's loading.tsx shows, when nothing is on screen yet.
 */
export const MembersBodySkeleton: React.FC = () => (
  <SkeletonTable columns={7} rows={8} />
);

export const MembersSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <SkeletonSectionHeader />
    <SkeletonFilterBar selects={3} date />
    <MembersBodySkeleton />
  </div>
);
