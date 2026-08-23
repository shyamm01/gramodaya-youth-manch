'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminSupabaseSetupPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" sectionTitle="Village Admin - Database Setup">
      <AdminPanel initialTab="supabase-setup" />
    </ProtectedRoute>
  );
}
