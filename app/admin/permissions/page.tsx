'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminPermissionsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Admin - User Permissions & Access">
      <AdminPanel initialTab="permissions" />
    </ProtectedRoute>
  );
}
