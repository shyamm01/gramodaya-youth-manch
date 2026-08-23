'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminAnnouncementsSection } from '@/src/components/admin/announcements/AdminAnnouncementsSection';

export default function AdminAnnouncementsPage() {
  return (
    <AdminShell tab="announcements">
      <AdminAnnouncementsSection />
    </AdminShell>
  );
}
