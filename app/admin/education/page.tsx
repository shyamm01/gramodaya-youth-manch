'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminEducationPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Education">
      <AdminPanel initialTab="education" />
    </ProtectedRoute>
  );
}
