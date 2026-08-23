'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminMembersSection } from '@/src/components/admin/members/AdminMembersSection';

export default function AdminMembersPage() {
  return (
    <AdminShell tab="members">
      <AdminMembersSection />
    </AdminShell>
  );
}
