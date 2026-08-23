'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminModulesSection } from '@/src/components/admin/modules/AdminModulesSection';

export default function AdminModulesPage() {
  return (
    <AdminShell tab="modules">
      <AdminModulesSection />
    </AdminShell>
  );
}
