'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminGrievancesSection } from '@/src/components/admin/grievances/AdminGrievancesSection';

export default function AdminProblemsPage() {
  return (
    <AdminShell tab="problems">
      <AdminGrievancesSection />
    </AdminShell>
  );
}
