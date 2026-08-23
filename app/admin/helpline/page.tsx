'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminHelplinePage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - Helpline Directory">
      <AdminPanel initialTab="helpline" />
    </ProtectedRoute>
  );
}
