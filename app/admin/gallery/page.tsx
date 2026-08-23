'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';
import { AdminGallerySection } from '@/src/components/admin/gallery/AdminGallerySection';

export default function AdminGalleryPage() {
  return (
    <AdminShell tab="gallery">
      <AdminGallerySection />
    </AdminShell>
  );
}
