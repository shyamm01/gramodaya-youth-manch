'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminSettingsSection } from '@/src/components/admin/settings/AdminSettingsSection';

export default function AdminSettingsPage() {
  return (
    <AdminShell tab="settings">
      <AdminSettingsSection />
    </AdminShell>
  );
}
