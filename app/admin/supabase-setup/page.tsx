import React from 'react';

/**
 * Supabase provisioning. Super-admin only, so everyone else meets the unauthorized card from the access policy.
 *
 * The panel has never had a screen for this tab — AdminPanel had no branch for
 * it either. The layout still supplies the sidebar, top bar and access gate;
 * only the content area is empty. The missing screen is a gap in the panel, not
 * in the routing.
 */
export default function AdminSupabaseSetupPage() {
  return null;
}
