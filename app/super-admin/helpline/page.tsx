'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminHelplinePage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - Helpline Directory">
      <AdminPanel initialTab="helpline" />
    </ProtectedRoute>
  );
}
