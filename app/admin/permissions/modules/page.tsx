'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminModulesPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - 13 System Modules Registry">
      <AdminPanel initialTab="permissions-modules" />
    </ProtectedRoute>
  );
}
