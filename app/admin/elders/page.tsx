'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminEldersSection } from '@/src/components/admin/elders/AdminEldersSection';

export default function AdminEldersPage() {
  return (
    <AdminShell tab="elders">
      <AdminEldersSection />
    </AdminShell>
  );
}
