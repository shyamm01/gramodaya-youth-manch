'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminSocialWorkSection } from '@/src/components/admin/social-work/AdminSocialWorkSection';

export default function AdminSocialWorkPage() {
  return (
    <AdminShell tab="social-work">
      <AdminSocialWorkSection />
    </AdminShell>
  );
}
