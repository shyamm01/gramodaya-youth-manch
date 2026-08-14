'use client';

import React from 'react';
import { LiveChatSection } from '@/src/components/pages';
import { ProtectedRoute } from '@/src/components/common';
import { useApp } from '@/src/context/AppContext';

export default function LiveChatPage() {
  const { t } = useApp();
  return (
    <ProtectedRoute requiredRole="MEMBER" sectionTitle={t('nav.liveChat')}>
      <LiveChatSection />
    </ProtectedRoute>
  );
}
