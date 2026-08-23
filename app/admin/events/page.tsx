'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminEventsSection } from '@/src/components/admin/events/AdminEventsSection';

export default function AdminEventsPage() {
  return (
    <AdminShell tab="events">
      <AdminEventsSection />
    </AdminShell>
  );
}
