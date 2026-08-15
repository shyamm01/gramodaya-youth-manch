'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminHelpdeskPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Admin Helpdesk & Citizen Inquiries">
      <AdminPanel initialTab="helpdesk" />
    </ProtectedRoute>
  );
}
