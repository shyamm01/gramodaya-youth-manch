'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminApiIntegrationsPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - API Keys & Integrations">
      <AdminPanel initialTab="api-integrations" />
    </ProtectedRoute>
  );
}
