'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminPermissionsSection } from '@/src/components/admin/permissions/AdminPermissionsSection';

export default function AdminPermissionsPage() {
  return (
    <AdminShell tab="permissions">
      <AdminPermissionsSection />
    </AdminShell>
  );
}
