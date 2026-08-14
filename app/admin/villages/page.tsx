'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminVillagesPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Village Units">
      <AdminPanel initialTab="villages" />
    </ProtectedRoute>
  );
}
