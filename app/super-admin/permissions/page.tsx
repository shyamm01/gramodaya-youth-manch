'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminPermissionsPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - User Permissions & Access">
      <AdminPanel initialTab="permissions" />
    </ProtectedRoute>
  );
}
