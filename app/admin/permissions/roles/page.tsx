'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminRolesPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - Role Presets & Rules">
      <AdminPanel initialTab="permissions-roles" />
    </ProtectedRoute>
  );
}
