import React from 'react';
import {
  SkeletonSectionHeader,
  SkeletonFilterBar,
  SkeletonTable,
} from '@/src/components/admin/section-ui';

/**
 * Fallback placeholder for admin segments without one of their own.
 *
 * A loading.tsx covers its segment *and* every segment nested under it, so the
 * dashboard's skeleton cannot live here — it would stand in for /admin/roles
 * and /admin/audit too, and flash four KPI tiles and two charts at screens that
 * have neither. The dashboard has its own in the (overview) route group, which
 * keeps the /admin URL while scoping the boundary to just that page.
 *
 * What is left here is deliberately plain: the sections that still fall through
 * — permissions, modules, roles, audit — are all header, filters and a table.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SkeletonSectionHeader />
      <SkeletonFilterBar selects={1} />
      <SkeletonTable columns={5} rows={6} />
    </div>
  );
}
