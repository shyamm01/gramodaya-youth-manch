'use client';

import React from 'react';
import { AdminShell } from '@/src/components/admin/layout/AdminShell';

/**
 * Third-party API integrations. Super-admin only: the access policy shows the unauthorized card to everyone else.
 *
 * AdminPanel had no `activeTab === 'api-integrations'` branch, so this route has always
 * rendered the admin chrome with an empty body. That is preserved here rather
 * than papered over — the missing screen is a gap in the panel, not in this
 * refactor.
 */
export default function AdminApiIntegrationsPage() {
  return <AdminShell tab="api-integrations">{null}</AdminShell>;
}
