import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import { ALL_SYSTEM_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@/src/lib/permissions';

export interface RolePreset {
  id: string | number;
  code: string;
  name: string;
  nameHindi: string;
  description: string;
  scope: 'GLOBAL' | 'VILLAGE';
  isSystem: boolean;
  permissions: string[];
  permissionsCount: number;
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const CANONICAL_ROLES: RolePreset[] = [
  {
    id: 'role_super_admin',
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    nameHindi: 'मुख्य प्रशासक (सुपर एडमिन)',
    description: 'Highest administrative authority with unrestricted CRUD access across all 13 modules, database configurations, and developer tools.',
    scope: 'GLOBAL',
    isSystem: true,
    permissions: ALL_SYSTEM_PERMISSIONS.map((p) => p.code),
    permissionsCount: ALL_SYSTEM_PERMISSIONS.length,
  },
  {
    id: 'role_admin',
    code: 'ADMIN',
    name: 'Village Administrator',
    nameHindi: 'ग्राम प्रशासक (विलेज एडमिन)',
    description: 'Chapter administrator with authority over village grievances, announcements, member approvals, social works, and chapter profile.',
    scope: 'VILLAGE',
    isSystem: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['ADMIN'] || [],
    permissionsCount: (ROLE_DEFAULT_PERMISSIONS['ADMIN'] || []).length,
  },
  {
    id: 'role_volunteer',
    code: 'VOLUNTEER',
    name: 'Volunteer / Field Worker',
    nameHindi: 'स्वयंसेवक / कार्यकर्ता',
    description: 'Community field worker role with permissions to report grievances, upload event photos, and coordinate social initiatives.',
    scope: 'VILLAGE',
    isSystem: true,
    permissions: [
      'complaints:create',
      'complaints:view',
      'social_works:create',
      'social_works:view',
      'events:view',
      'gallery:create',
      'gallery:upload',
      'gallery:view',
      'announcements:view',
      'education:view',
      'chat:participate',
    ],
    permissionsCount: 11,
  },
  {
    id: 'role_member',
    code: 'MEMBER',
    name: 'Member / Resident',
    nameHindi: 'पंजीकृत सदस्य / नागरिक',
    description: 'Default verified member role with access to submit grievances, participate in live discussions, view announcements and directory.',
    scope: 'VILLAGE',
    isSystem: true,
    permissions: ROLE_DEFAULT_PERMISSIONS['MEMBER'] || [],
    permissionsCount: (ROLE_DEFAULT_PERMISSIONS['MEMBER'] || []).length,
  },
];

// In-memory store for custom roles created during session
let customRolesStore: RolePreset[] = [];

export async function GET() {
  try {
    const allRoles = [...CANONICAL_ROLES, ...customRolesStore];

    return NextResponse.json({
      success: true,
      roles: allRoles,
      total: allRoles.length,
      availablePermissions: ALL_SYSTEM_PERMISSIONS,
    });
  } catch (err: any) {
    console.error('Error fetching roles catalog:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, nameHindi, description, scope, permissions } = body;

    if (!code || !name || !nameHindi) {
      return NextResponse.json(
        { success: false, error: 'Role code, English name, and Hindi name are required.' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

    // Check if code already exists
    const allRoles = [...CANONICAL_ROLES, ...customRolesStore];
    if (allRoles.some((r) => r.code === cleanCode)) {
      return NextResponse.json(
        { success: false, error: `Role with code '${cleanCode}' already exists.` },
        { status: 409 }
      );
    }

    const assignedPerms = Array.isArray(permissions) ? permissions : [];

    const newRole: RolePreset = {
      id: `role_${Date.now()}`,
      code: cleanCode,
      name,
      nameHindi,
      description: description || '',
      scope: scope === 'GLOBAL' ? 'GLOBAL' : 'VILLAGE',
      isSystem: false,
      permissions: assignedPerms,
      permissionsCount: assignedPerms.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customRolesStore.push(newRole);

    return NextResponse.json({
      success: true,
      role: newRole,
      message: `Role '${name}' created successfully`,
    });
  } catch (err: any) {
    console.error('Error creating role:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create role' },
      { status: 500 }
    );
  }
}
