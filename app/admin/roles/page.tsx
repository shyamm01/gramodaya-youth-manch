'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminRolesSection } from '@/src/components/admin/roles/AdminRolesSection';

export default function AdminRolesPage() {
  return (
    <AdminShell tab="roles">
      <AdminRolesSection />
    </AdminShell>
  );
}
