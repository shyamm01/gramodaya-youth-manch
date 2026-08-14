'use client';

import React from 'react';
import { MembersSection } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';
import { useApp } from '@/src/context/AppContext';

export default function MembersPage() {
  const { t } = useApp();
  return (
    <ProtectedRoute requiredRole="MEMBER" sectionTitle={t('members.protectedTitle')}>
      <MembersSection />
    </ProtectedRoute>
  );
}
