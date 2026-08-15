import { PermissionCode, SystemRole, RoleScope, AuthSession } from '../types';

export interface SystemPermissionDef {
  code: PermissionCode;
  name: string;
  module: 'village' | 'members' | 'complaints' | 'social_works' | 'events' | 'gallery' | 'announcements' | 'public_info' | 'elders' | 'chat' | 'audit' | 'settings';
  description: string;
}

export const ALL_SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  { code: 'village:manage', name: 'ग्राम प्रबंधन (Village Management)', module: 'village', description: 'Create and configure villages and locations' },
  { code: 'village:settings:update', name: 'ग्राम सेटिंग्स संपादन', module: 'settings', description: 'Update village profile, branding and slogans' },
  { code: 'members:view', name: 'सदस्य सूची देखना', module: 'members', description: 'View village member directory' },
  { code: 'members:create', name: 'नया सदस्य जोड़ना', module: 'members', description: 'Register new village members' },
  { code: 'members:approve', name: 'सदस्य अनुमोदन (Approve)', module: 'members', description: 'Approve pending member registrations' },
  { code: 'members:update', name: 'सदस्य डेटा संपादन', module: 'members', description: 'Edit member profile and details' },
  { code: 'members:delete', name: 'सदस्य निष्कासन', module: 'members', description: 'Remove or archive members' },
  { code: 'members:roles:assign', name: 'भूमिका आवंटन (Role Assignment)', module: 'members', description: 'Assign village admin and moderator roles' },
  { code: 'permissions:manage', name: 'अनुमति प्रबंधन (User Permissions)', module: 'settings', description: 'Manage user-level permission overrides' },
  { code: 'complaints:view', name: 'समस्याएं देखना', module: 'complaints', description: 'View public and member grievances' },
  { code: 'complaints:create', name: 'समस्या दर्ज करना', module: 'complaints', description: 'Submit a new complaint or issue' },
  { code: 'complaints:update', name: 'समस्या संपादन व स्थिति बदलना', module: 'complaints', description: 'Change status (In Progress, etc.)' },
  { code: 'complaints:resolve', name: 'समस्या निस्तारण (Resolve)', module: 'complaints', description: 'Mark complaints as officially resolved' },
  { code: 'complaints:delete', name: 'समस्या हटाना', module: 'complaints', description: 'Delete invalid complaint entries' },
  { code: 'social_works:manage', name: 'सामाजिक कार्य प्रबंधन', module: 'social_works', description: 'Create and update social development work' },
  { code: 'social_works:publish', name: 'सामाजिक कार्य प्रकाशन', module: 'social_works', description: 'Approve and publish social initiatives' },
  { code: 'events:manage', name: 'कार्यक्रम प्रबंधन', module: 'events', description: 'Create and edit village events' },
  { code: 'events:publish', name: 'कार्यक्रम प्रकाशन', module: 'events', description: 'Publish events to community' },
  { code: 'gallery:upload', name: 'गैलरी फोटो अपलोड', module: 'gallery', description: 'Upload photos to village gallery' },
  { code: 'gallery:moderate', name: 'गैलरी मॉडरेशन', module: 'gallery', description: 'Approve/delete village photos' },
  { code: 'announcements:publish', name: 'ग्राम सूचना प्रकाशन', module: 'announcements', description: 'Publish official notices for village' },
  { code: 'announcements:global_broadcast', name: 'वैश्विक सूचना प्रसारण', module: 'announcements', description: 'Publish global announcements across all villages' },
  { code: 'public_info:manage', name: 'सार्वजनिक सूचना प्रबंधन', module: 'public_info', description: 'Review citizen public information submissions' },
  { code: 'elders:manage', name: 'बुजुर्ग सूची प्रबंधन', module: 'elders', description: 'Manage village elder care registry' },
  { code: 'chat:participate', name: 'लाइव चैट में संवाद', module: 'chat', description: 'Send messages in community chat' },
  { code: 'chat:moderate', name: 'चैट मॉडरेशन', module: 'chat', description: 'Delete inappropriate messages and manage rooms' },
  { code: 'audit:view', name: 'ऑडिट लॉग्स देखना', module: 'audit', description: 'Inspect system activity and admin audit logs' },
  { code: 'integrations:manage', name: 'सिस्टम एकीकरण', module: 'settings', description: 'Configure Supabase and external APIs' },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<SystemRole, PermissionCode[]> = {
  SUPER_ADMIN: ALL_SYSTEM_PERMISSIONS.map((p) => p.code),
  ADMIN: [
    'village:settings:update',
    'members:view',
    'members:create',
    'members:approve',
    'members:update',
    'complaints:view',
    'complaints:create',
    'complaints:update',
    'complaints:resolve',
    'social_works:manage',
    'social_works:publish',
    'events:manage',
    'events:publish',
    'gallery:upload',
    'gallery:moderate',
    'announcements:publish',
    'public_info:manage',
    'elders:manage',
    'chat:participate',
    'chat:moderate',
    'audit:view',
  ],
  MEMBER: [
    'members:view',
    'complaints:view',
    'complaints:create',
    'gallery:upload',
    'chat:participate',
  ],
};

/**
 * Check if a user has a specific permission for a given village scope
 */
export function hasUserPermission(
  session: AuthSession | null | undefined,
  permission: PermissionCode,
  targetVillageId?: string
): boolean {
  if (!session) return false;

  // 1. Super Admin has unrestricted access to ALL operations in ALL modules across the entire app
  if (
    session.systemRole === 'SUPER_ADMIN' ||
    session.role === 'SUPER_ADMIN' ||
    session.currentMember?.systemRole === 'SUPER_ADMIN' ||
    (session as any).isSuperAdmin
  ) {
    return true;
  }

  // 2. Legacy admin session check fallback
  if (session.isAdminLoggedIn && (!session.role || session.role === 'ADMIN')) {
    return true;
  }

  // 3. User-Level Explicit Overrides Check
  if (session.permissions && session.permissions.includes(permission)) {
    // If target village is specified, check village accessibility
    if (targetVillageId && session.accessibleVillages && session.accessibleVillages.length > 0) {
      if (!session.accessibleVillages.includes(targetVillageId)) {
        return false;
      }
    }
    return true;
  }

  // 4. Role-based fallback
  const userRole = (session.role as SystemRole) || (session.isAdminLoggedIn ? 'ADMIN' : 'MEMBER');
  const rolePerms = ROLE_DEFAULT_PERMISSIONS[userRole] || [];

  if (!rolePerms.includes(permission)) {
    return false;
  }

  // 5. Check Village Scoping for village-level admins
  if (targetVillageId && userRole === 'ADMIN' && session.activeVillageId) {
    return session.activeVillageId === targetVillageId;
  }

  return true;
}
