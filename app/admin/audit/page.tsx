'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminAuditSection } from '@/src/components/admin/audit/AdminAuditSection';

export default function AdminAuditPage() {
  return (
    <AdminShell tab="audit">
      <AdminAuditSection />
    </AdminShell>
  );
}
