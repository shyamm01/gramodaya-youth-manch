'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Platform Settings & Reset">
      <AdminPanel initialTab="settings" />
    </ProtectedRoute>
  );
}
