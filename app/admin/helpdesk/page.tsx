'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminHelpdeskSection } from '@/src/components/admin/sections/AdminHelpdeskSection';

export default function AdminHelpdeskPage() {
  return (
    <AdminShell tab="helpdesk">
      <AdminHelpdeskSection />
    </AdminShell>
  );
}
