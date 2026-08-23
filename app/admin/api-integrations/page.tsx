'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminApiIntegrationsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - API Integrations">
      <AdminPanel initialTab="api-integrations" />
    </ProtectedRoute>
  );
}
