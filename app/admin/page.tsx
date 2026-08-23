'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminDashboardSection } from '@/src/components/admin/dashboard/AdminDashboardSection';

export default function AdminDashboardPage() {
  return (
    <AdminShell tab="dashboard">
      <AdminDashboardSection />
    </AdminShell>
  );
}
