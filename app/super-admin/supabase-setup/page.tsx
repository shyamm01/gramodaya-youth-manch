'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function SuperAdminSupabaseSetupPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Super Admin - Database Schema Setup">
      <AdminPanel initialTab="supabase-setup" />
    </ProtectedRoute>
  );
}
