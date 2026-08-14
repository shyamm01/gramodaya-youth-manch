'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="मुख्य एडमिन प्रबंधन (Admin Control Center)">
      <AdminPanel />
    </ProtectedRoute>
  );
}
