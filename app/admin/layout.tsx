'use client';

import React from 'react';
import { ProtectedRoute } from '@/src/components/common';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
