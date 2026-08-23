'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminSecurityPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - Security & Audit Logs">
      <AdminPanel initialTab="security" />
    </ProtectedRoute>
  );
}
