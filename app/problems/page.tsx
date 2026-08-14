'use client';

import React from 'react';
import { ProblemsSection } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';
import { useApp } from '@/src/context/AppContext';

export default function ProblemsPage() {
  const { t } = useApp();
  return (
    <ProtectedRoute requiredRole="MEMBER" sectionTitle={t('problems.title')}>
      <ProblemsSection />
    </ProtectedRoute>
  );
}
