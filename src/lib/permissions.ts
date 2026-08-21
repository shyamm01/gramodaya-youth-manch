import { PermissionCode, SystemRole, RoleScope, AuthSession } from '../types';

export type AppModuleId =
  | 'village'
  | 'members'
  | 'complaints'
  | 'social_works'
  | 'events'
  | 'gallery'
  | 'announcements'
  | 'public_info'
  | 'elders'
  | 'education'
  | 'chat'
  | 'audit'
  | 'settings';

export interface SystemPermissionDef {
  code: PermissionCode;
  name: string;
  module: AppModuleId;
  description: string;
}

export interface ModuleDefinition {
  id: AppModuleId;
  nameHindi: string;
  nameEnglish: string;
  description: string;
  permissions: SystemPermissionDef[];
}

export const ALL_SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  // 1. Village Chapter Module
  { code: 'village:manage', name: 'ग्राम प्रबंधन (Village Management)', module: 'village', description: 'Create and configure villages and locations' },
  { code: 'village:settings:update', name: 'ग्राम सेटिंग्स संपादन', module: 'settings', description: 'Update village profile, branding and slogans' },
  
  // 2. Members Module
  { code: 'members:view', name: 'सदस्य सूची देखना', module: 'members', description: 'View village member directory' },
  { code: 'members:create', name: 'नया सदस्य जोड़ना', module: 'members', description: 'Register new village members' },
  { code: 'members:approve', name: 'सदस्य अनुमोदन (Approve)', module: 'members', description: 'Approve pending member registrations' },
  { code: 'members:update', name: 'सदस्य डेटा संपादन', module: 'members', description: 'Edit member profile and details' },
  { code: 'members:delete', name: 'सदस्य निष्कासन', module: 'members', description: 'Remove or archive members' },
  { code: 'members:roles:assign', name: 'भूमिका आवंटन (Role Assignment)', module: 'members', description: 'Assign village admin and moderator roles' },
  
  // 3. Complaints / Grievances Module
  { code: 'complaints:view', name: 'समस्याएं देखना', module: 'complaints', description: 'View public and member grievances' },
  { code: 'complaints:create', name: 'समस्या दर्ज करना', module: 'complaints', description: 'Submit a new complaint or issue' },
  { code: 'complaints:update', name: 'समस्या संपादन व स्थिति बदलना', module: 'complaints', description: 'Change status (In Progress, etc.)' },
  { code: 'complaints:resolve', name: 'समस्या निस्तारण (Resolve)', module: 'complaints', description: 'Mark complaints as officially resolved' },
  { code: 'complaints:delete', name: 'समस्या हटाना', module: 'complaints', description: 'Delete invalid complaint entries' },
  
  // 4. Social Works Module
  { code: 'social_works:manage', name: 'सामाजिक कार्य प्रबंधन', module: 'social_works', description: 'Create and update social development work' },
  { code: 'social_works:publish', name: 'सामाजिक कार्य प्रकाशन', module: 'social_works', description: 'Approve and publish social initiatives' },
  
  // 5. Events Module
  { code: 'events:manage', name: 'कार्यक्रम प्रबंधन', module: 'events', description: 'Create and edit village events' },
  { code: 'events:publish', name: 'कार्यक्रम प्रकाशन', module: 'events', description: 'Publish events to community' },
  
  // 6. Gallery Module
  { code: 'gallery:upload', name: 'गैलरी फोटो अपलोड', module: 'gallery', description: 'Upload photos to village gallery' },
  { code: 'gallery:moderate', name: 'गैलरी मॉडरेशन', module: 'gallery', description: 'Approve/delete village photos' },
  
  // 7. Announcements Module
  { code: 'announcements:publish', name: 'ग्राम सूचना प्रकाशन', module: 'announcements', description: 'Publish official notices for village' },
  { code: 'announcements:global_broadcast', name: 'वैश्विक सूचना प्रसारण', module: 'announcements', description: 'Publish global announcements across all villages' },
  
  // 8. Public Information Module
  { code: 'public_info:manage', name: 'सार्वजनिक सूचना प्रबंधन', module: 'public_info', description: 'Review citizen public information submissions' },
  
  // 9. Elders Care Module
  { code: 'elders:manage', name: 'बुजुर्ग सूची प्रबंधन', module: 'elders', description: 'Manage village elder care registry' },
  
  // 10. Education Module
  { code: 'education:view', name: 'शिक्षा सामग्री देखना', module: 'education', description: 'View education categories, schemes and enquiries' },
  { code: 'education:manage', name: 'शिक्षा योजना प्रबंधन', module: 'education', description: 'Create and edit education categories, schemes and resources' },
  { code: 'education:publish', name: 'शिक्षा सामग्री प्रकाशन', module: 'education', description: 'Publish, archive or delete education content and resolve enquiries' },

  // 11. Live Chat Module
  { code: 'chat:participate', name: 'लाइव चैट में संवाद', module: 'chat', description: 'Send messages in community chat' },
  { code: 'chat:moderate', name: 'चैट मॉडरेशन', module: 'chat', description: 'Delete inappropriate messages and manage rooms' },
  
  // 12. Audit Module
  { code: 'audit:view', name: 'ऑडिट लॉग्स देखना', module: 'audit', description: 'Inspect system activity and admin audit logs' },
  
  // 13. Settings & Integrations Module
  { code: 'permissions:manage', name: 'अनुमति प्रबंधन (User Permissions)', module: 'settings', description: 'Manage user-level permission overrides' },
  { code: 'integrations:manage', name: 'सिस्टम एकीकरण', module: 'settings', description: 'Configure database, Supabase and external APIs' },
];

export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    id: 'village',
    nameHindi: 'ग्राम प्रबंधन',
    nameEnglish: 'Village Management',
    description: 'मल्टी-विलेज प्रबंधन एवं क्षेत्रीय शाखाएं',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'village'),
  },
  {
    id: 'members',
    nameHindi: 'सदस्य प्रबंधन',
    nameEnglish: 'Member Management',
    description: 'सदस्य निर्देशिका, सत्यापन और पद आवंटन',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'members'),
  },
  {
    id: 'complaints',
    nameHindi: 'समस्या निवारण',
    nameEnglish: 'Grievance Redressal',
    description: 'ग्राम शिकायतें, ट्रैकिंग और समाधान',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'complaints'),
  },
  {
    id: 'social_works',
    nameHindi: 'सामाजिक कार्य',
    nameEnglish: 'Social Initiatives',
    description: 'सामुदायिक सेवा कार्य एवं विकास योजनाएं',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'social_works'),
  },
  {
    id: 'events',
    nameHindi: 'ग्राम कार्यक्रम',
    nameEnglish: 'Village Events',
    description: 'सामुदायिक बैठकें, उत्सव और आयोजन',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'events'),
  },
  {
    id: 'gallery',
    nameHindi: 'चित्रशाला',
    nameEnglish: 'Photo Gallery',
    description: 'गांव की तस्वीरें एवं मीडिया मॉडरेशन',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'gallery'),
  },
  {
    id: 'announcements',
    nameHindi: 'आधिकारिक सूचनाएं',
    nameEnglish: 'Announcements',
    description: 'ग्राम अलर्ट, घोषणाएं और सूचना प्रसारण',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'announcements'),
  },
  {
    id: 'public_info',
    nameHindi: 'सार्वजनिक सूचनाएं',
    nameEnglish: 'Public Information',
    description: 'नागरिक सूचनाएं एवं सामान्य जानकारी',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'public_info'),
  },
  {
    id: 'elders',
    nameHindi: 'बुजुर्ग सम्मान',
    nameEnglish: 'Elder Care',
    description: 'वरिष्ठ नागरिक सूची एवं सहायता',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'elders'),
  },
  {
    id: 'education',
    nameHindi: 'शिक्षा एवं मार्गदर्शन',
    nameEnglish: 'Education & Guidance',
    description: 'छात्रवृत्ति, सरकारी योजनाएं, कैरियर मार्गदर्शन एवं शिक्षा सहायता',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'education'),
  },
  {
    id: 'chat',
    nameHindi: 'लाइव चैट',
    nameEnglish: 'Live Chat',
    description: 'ग्राम संवाद कक्ष एवं संदेश मॉडरेशन',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'chat'),
  },
  {
    id: 'audit',
    nameHindi: 'ऑडिट लॉग्स',
    nameEnglish: 'Audit Logs',
    description: 'सुरक्षा, गतिविधि इतिहास और ट्रैकिंग',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'audit'),
  },
  {
    id: 'settings',
    nameHindi: 'सिस्टम सेटिंग्स',
    nameEnglish: 'System Settings',
    description: 'PBAC अनुमतियां, डेटाबेस व एकीकरण',
    permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.module === 'settings'),
  },
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
    'education:view',
    'education:manage',
    'education:publish',
    'chat:participate',
    'chat:moderate',
    'audit:view',
  ],
  MEMBER: [
    'members:view',
    'complaints:view',
    'complaints:create',
    'gallery:upload',
    'education:view',
    'chat:participate',
  ],
};

/**
 * Check if a session belongs to a Super Admin
 */
export function isSuperAdmin(session: AuthSession | null | undefined): boolean {
  if (!session) return false;
  return Boolean(
    session.systemRole === 'SUPER_ADMIN' ||
      session.role === 'SUPER_ADMIN' ||
      session.currentMember?.systemRole === 'SUPER_ADMIN' ||
      (session as any).isSuperAdmin
  );
}

/**
 * Check if a user has a specific permission for a given village scope (supports wildcards e.g. "complaints:*")
 */
export function hasUserPermission(
  session: AuthSession | null | undefined,
  permission: PermissionCode | string,
  targetVillageId?: string
): boolean {
  if (!session) return false;

  // 1. Super Admin has unrestricted access to ALL operations in ALL modules across the entire app
  if (isSuperAdmin(session)) {
    return true;
  }

  // 2. Legacy admin session check fallback
  if (session.isAdminLoggedIn && (!session.role || session.role === 'ADMIN')) {
    return true;
  }

  // 3. Handle module wildcard (e.g. "complaints:*")
  if (permission.endsWith(':*')) {
    const targetModule = permission.replace(':*', '');
    const userRole = (session.systemRole as SystemRole) || (session.role as SystemRole) || 'MEMBER';
    const rolePerms = ROLE_DEFAULT_PERMISSIONS[userRole] || [];
    const customPerms = session.permissions || [];
    const allEffective = new Set([...rolePerms, ...customPerms]);

    return Array.from(allEffective).some((p) => p.startsWith(`${targetModule}:`));
  }

  // 4. User-Level Explicit Overrides Check
  if (session.permissions && session.permissions.includes(permission as PermissionCode)) {
    // If target village is specified, check village accessibility
    if (targetVillageId && session.accessibleVillages && session.accessibleVillages.length > 0) {
      if (!session.accessibleVillages.includes(targetVillageId)) {
        return false;
      }
    }
    return true;
  }

  // 5. Role-based fallback
  const userRole =
    (session.systemRole as SystemRole) ||
    (session.role as SystemRole) ||
    (session.isAdminLoggedIn ? 'ADMIN' : 'MEMBER');
  const rolePerms = ROLE_DEFAULT_PERMISSIONS[userRole] || [];

  if (!rolePerms.includes(permission as PermissionCode)) {
    return false;
  }

  // 6. Check Village Scoping for village-level admins
  if (targetVillageId && userRole === 'ADMIN' && session.activeVillageId) {
    return session.activeVillageId === targetVillageId;
  }

  return true;
}

/**
 * Resolves full effective capability matrix for a session
 */
export function resolveEffectivePermissions(
  session: AuthSession | null | undefined,
  targetVillageId?: string
) {
  const isSuper = isSuperAdmin(session);
  const isAdminRole = isSuper || session?.isAdminLoggedIn || session?.role === 'ADMIN' || session?.systemRole === 'ADMIN';

  const userRole: SystemRole = isSuper ? 'SUPER_ADMIN' : isAdminRole ? 'ADMIN' : 'MEMBER';
  const roleDefaultList = ROLE_DEFAULT_PERMISSIONS[userRole] || [];
  const customOverrides = session?.permissions || [];

  const effectiveSet = isSuper
    ? new Set(ALL_SYSTEM_PERMISSIONS.map((p) => p.code))
    : new Set([...roleDefaultList, ...customOverrides]);

  return {
    isSuperAdmin: isSuper,
    isAdmin: isAdminRole,
    role: userRole,
    effectivePermissions: Array.from(effectiveSet),
    can: (perm: PermissionCode | string) => hasUserPermission(session, perm, targetVillageId),
    canModule: (moduleId: AppModuleId) => hasUserPermission(session, `${moduleId}:*`, targetVillageId),
  };
}
