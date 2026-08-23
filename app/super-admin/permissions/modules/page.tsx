'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminModulesPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - 13 System Modules Registry">
      <AdminPanel initialTab="permissions-modules" />
    </ProtectedRoute>
  );
}
