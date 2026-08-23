'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminRolesPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - Role Presets & Rules">
      <AdminPanel initialTab="permissions-roles" />
    </ProtectedRoute>
  );
}
