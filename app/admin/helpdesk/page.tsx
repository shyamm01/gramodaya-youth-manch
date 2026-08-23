'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminHelpdeskPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - Helpdesk">
      <AdminPanel initialTab="helpdesk" requiredRole="ADMIN" />
    </ProtectedRoute>
  );
}
