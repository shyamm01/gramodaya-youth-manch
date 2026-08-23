'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminSecurityPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - Security & Audit Trail">
      <AdminPanel initialTab="security" />
    </ProtectedRoute>
  );
}
