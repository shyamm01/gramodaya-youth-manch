'use client';

import React from 'react';
import { ProtectedRoute } from '@/src/components/common';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';

/**
 * Everything every admin screen shares, mounted once.
 *
 * The sidebar, the top bar, the quick-create modal and the permission gate all
 * live here rather than in the pages. A page under /admin is now only its
 * section — the chrome is not re-created when you move between them, so the
 * sidebar keeps its collapsed state and its open accordions across a nav.
 *
 * ProtectedRoute stays the outer gate (is anyone signed in at all); AdminShell
 * is the inner one (is this person an admin, and may they open this screen).
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
