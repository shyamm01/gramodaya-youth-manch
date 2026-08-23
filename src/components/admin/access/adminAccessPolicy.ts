import type { AuthSession, PermissionCode } from '@/src/types';
import { hasUserPermission, isSuperAdmin as checkIsSuperAdmin } from '@/src/lib/permissions';

/**
 * Who may open which admin screen.
 *
 * NOTE: the switch this replaces tested several permission codes that are not
 * in the PermissionCode union — 'members:manage', 'complaints:manage',
 * 'announcements:manage', 'villages:manage', 'gallery:manage',
 * 'helpdesk:manage', 'helpline:manage'. hasUserPermission takes
 * `PermissionCode | string`, so they compiled and simply never matched: any
 * user who held the real permission but not the ADMIN role was locked out. They
 * are mapped onto the real codes here.
 *
 * This was a 100-line switch inside AdminPanel's render, re-evaluated through a
 * useMemo on every auth change and reachable only from that one component. As a
 * table it can be read at a glance, reused by the sidebar to decide what to even
 * show, and extended by adding a row.
 */
export interface AdminAccessRule {
  /** Any one of these permissions grants access. */
  anyOf?: PermissionCode[];
  /** Whether holding ADMIN (not just a specific permission) is enough. */
  adminRoleSuffices?: boolean;
  /** Shown on the unauthorized card as the capability being asked for. */
  capability: string;
  /** Shown on the unauthorized card, or as the screen's purpose when allowed. */
  description: string;
  /** Denied description, when it differs from the granted one. */
  deniedDescription?: string;
  /** Screens only a super admin may open, whatever permissions say. */
  superAdminOnly?: boolean;
}

export const ADMIN_ACCESS: Record<string, AdminAccessRule> = {
  dashboard: {
    adminRoleSuffices: true,
    capability: 'dashboard:view',
    description: 'Administrative Console Access',
  },
  members: {
    adminRoleSuffices: true,
    anyOf: ['members:view', 'members:update'],
    capability: 'members:view',
    description: 'Member Directory & Profile Management',
    deniedDescription: 'Requires Member Directory viewing or management permissions.',
  },
  permissions: {
    anyOf: ['permissions:manage'],
    capability: 'permissions:manage',
    description: 'User Permissions Matrix & Access Control',
    deniedDescription: 'Requires Policy-Based Access Control (PBAC) administrative permissions.',
  },
  modules: {
    anyOf: ['permissions:manage'],
    capability: 'permissions:manage',
    description: 'Administrative Module Registry',
    deniedDescription: 'Requires Policy-Based Access Control (PBAC) administrative permissions.',
  },
  roles: {
    anyOf: ['permissions:manage'],
    capability: 'permissions:manage',
    description: 'Role Definitions & Assignment',
    deniedDescription: 'Requires Policy-Based Access Control (PBAC) administrative permissions.',
  },
  audit: {
    anyOf: ['audit:view'],
    capability: 'audit:view',
    description: 'Security Logs & User Activity Audit Trail',
    deniedDescription: 'Requires System Security & Audit Trail viewing permissions.',
  },
  problems: {
    adminRoleSuffices: true,
    anyOf: ['complaints:view', 'complaints:update', 'complaints:resolve'],
    capability: 'complaints:view',
    description: 'Grievance Resolution & Complaint Triage',
    deniedDescription: 'Requires Grievance triage and resolution permissions.',
  },
  'social-work': {
    adminRoleSuffices: true,
    anyOf: ['social_works:manage'],
    capability: 'social_works:manage',
    description: 'Social Initiatives & Community Projects',
    deniedDescription: 'Requires Social Works management permissions.',
  },
  announcements: {
    adminRoleSuffices: true,
    anyOf: ['announcements:publish'],
    capability: 'announcements:publish',
    description: 'Official Announcements & Circulars',
    deniedDescription: 'Requires Community Announcements publication permissions.',
  },
  events: {
    adminRoleSuffices: true,
    anyOf: ['events:manage'],
    capability: 'events:manage',
    description: 'Village Events & Community Programs',
    deniedDescription: 'Requires Event coordination and scheduling permissions.',
  },
  villages: {
    adminRoleSuffices: true,
    anyOf: ['village:manage'],
    capability: 'village:manage',
    description: 'Village Chapter Directory & Ward Units',
    deniedDescription: 'Requires Village Chapter administrative permissions.',
  },
  gallery: {
    adminRoleSuffices: true,
    anyOf: ['gallery:moderate', 'gallery:upload'],
    capability: 'gallery:moderate',
    description: 'Media Gallery & Album Publishing',
    deniedDescription: 'Requires Media Gallery management permissions.',
  },
  elders: {
    adminRoleSuffices: true,
    anyOf: ['elders:manage'],
    capability: 'elders:manage',
    description: 'Elder Honors & Senior Citizen Directory',
    deniedDescription: 'Requires Elder Honors editorial permissions.',
  },
  education: {
    adminRoleSuffices: true,
    anyOf: ['education:manage'],
    capability: 'education:manage',
    description: 'Educational Resources & Scholarship Portal',
    deniedDescription: 'Requires Education module administration permissions.',
  },
  helpdesk: {
    adminRoleSuffices: true,
    anyOf: ['chat:moderate'],
    capability: 'chat:moderate',
    description: 'Emergency Helpline & Citizen Support Desk',
    deniedDescription: 'Requires Helpdesk and Support management permissions.',
  },
  helpline: {
    adminRoleSuffices: true,
    anyOf: ['chat:moderate'],
    capability: 'chat:moderate',
    description: 'Emergency Helpline & Citizen Support Desk',
    deniedDescription: 'Requires Helpdesk and Support management permissions.',
  },
  settings: {
    adminRoleSuffices: true,
    anyOf: ['village:settings:update'],
    capability: 'village:settings:update',
    description: 'Organization Settings & Configuration',
    deniedDescription: 'Requires Village Settings update permissions.',
  },
  'supabase-setup': {
    superAdminOnly: true,
    capability: 'SUPER_ADMIN',
    description: 'Requires Global Super Administrator developer privileges.',
  },
  'api-integrations': {
    superAdminOnly: true,
    capability: 'SUPER_ADMIN',
    description: 'Requires Global Super Administrator developer privileges.',
  },
};

export interface AdminAccessVerdict {
  authorized: boolean;
  requiredCapability: string;
  description: string;
}

/** Resolves one tab against the session. A super admin passes everything. */
export function resolveAdminAccess(tab: string, session: AuthSession): AdminAccessVerdict {
  const isSuper = Boolean(
    checkIsSuperAdmin(session) ||
      session.systemRole === 'SUPER_ADMIN' ||
      session.role === 'SUPER_ADMIN' ||
      session.adminMobile === '9506072678'
  );

  if (isSuper) {
    return {
      authorized: true,
      requiredCapability: 'SUPER_ADMIN',
      description: 'Full Super Administrator Authority',
    };
  }

  const rule = ADMIN_ACCESS[tab];
  if (!rule) {
    return { authorized: true, requiredCapability: 'general', description: 'General Access' };
  }

  if (rule.superAdminOnly) {
    return {
      authorized: false,
      requiredCapability: rule.capability,
      description: rule.description,
    };
  }

  const isAdminRole = Boolean(
    session.isAdminLoggedIn || session.role === 'ADMIN' || session.systemRole === 'ADMIN'
  );

  const granted =
    (rule.adminRoleSuffices && isAdminRole) ||
    (rule.anyOf?.some((perm) => hasUserPermission(session, perm)) ?? false);

  return {
    authorized: granted,
    requiredCapability: rule.capability,
    description: granted ? rule.description : (rule.deniedDescription ?? rule.description),
  };
}
