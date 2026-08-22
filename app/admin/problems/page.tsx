'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminProblemsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Grievances Management">
      <AdminPanel initialTab="problems" />
    </ProtectedRoute>
  );
}
