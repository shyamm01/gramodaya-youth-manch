'use client';

import React from 'react';
import { AdminPanel } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminGalleryPage() {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" sectionTitle="Media & Gallery">
      <AdminPanel initialTab="gallery" />
    </ProtectedRoute>
  );
}
