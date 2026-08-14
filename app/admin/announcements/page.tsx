'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminAnnouncementsPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Announcements & Notices">
      <AdminPanel initialTab="announcements" />
    </ProtectedRoute>
  );
}
