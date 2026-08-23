'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';

/**
 * Emergency helpline directory.
 *
 * AdminPanel had no `activeTab === 'helpline'` branch, so this route has always
 * rendered the admin chrome with an empty body. That is preserved here rather
 * than papered over — the missing screen is a gap in the panel, not in this
 * refactor.
 */
export default function AdminHelplinePage() {
  return <AdminShell tab="helpline">{null}</AdminShell>;
}
