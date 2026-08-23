import type { AdminSectionKey } from '@/src/store/slices/adminUiSlice';

/**
 * The mapping between an admin URL and the tab the chrome highlights.
 *
 * The panel has three names for some screens — the route segment, the sidebar's
 * id, and the older `/super-admin/permissions/roles` style paths that still get
 * linked. AdminPanel resolved them inline in a useMemo; keeping it here means
 * the sidebar, the shell and the access policy all agree on what tab is open.
 */

const TAB_ALIASES: Record<string, string> = {
  'permissions/modules': 'modules',
  'permissions/roles': 'roles',
  'permissions/audit': 'audit',
  security: 'audit',
};

/** Route → tab. `/admin` and anything unrecognised fall back to the dashboard. */
export function deriveAdminTab(pathname: string | null): string {
  if (!pathname) return 'dashboard';
  const segment = pathname.replace(/^\/(super-admin|admin)\/?/, '').replace(/\/$/, '');
  if (!segment) return 'dashboard';
  return TAB_ALIASES[segment] ?? segment;
}

/** Tab → route, the inverse used by the sidebar and the quick-create modal. */
export function adminTabToPath(tab: string): string {
  return tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
}

/**
 * Tab → the adminUi section key, where one exists.
 *
 * Only the tabs with a create form appear here: quick-create uses this to open
 * the right section's form after it navigates. Tabs backed by their own local
 * state (education, audit, roles) are deliberately absent.
 */
export const TAB_TO_SECTION: Record<string, AdminSectionKey> = {
  members: 'members',
  problems: 'problems',
  'social-work': 'socialWork',
  announcements: 'announcements',
  events: 'events',
  villages: 'villages',
  gallery: 'gallery',
  elders: 'elders',
};
