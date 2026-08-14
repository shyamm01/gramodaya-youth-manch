'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminSocialWorkPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - Social Initiatives">
      <AdminPanel initialTab="social-work" />
    </ProtectedRoute>
  );
}
