'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="मुख्य सुपर एडमिन डैशबोर्ड (Super Admin Dashboard)">
      <AdminPanel />
    </ProtectedRoute>
  );
}
