'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminEducationSection } from '@/src/components/admin/sections/AdminEducationSection';

export default function AdminEducationPage() {
  return (
    <AdminShell tab="education">
      <AdminEducationSection />
    </AdminShell>
  );
}
