'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminVillagesSection } from '@/src/components/admin/villages/AdminVillagesSection';

export default function AdminVillagesPage() {
  return (
    <AdminShell tab="villages">
      <AdminVillagesSection />
    </AdminShell>
  );
}
