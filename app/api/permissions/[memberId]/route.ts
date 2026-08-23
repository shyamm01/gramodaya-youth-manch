import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { logAuditAction } from '@/src/lib/authUtils';
import { ALL_SYSTEM_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@/src/lib/permissions';
import { requireAuth } from '@/src/lib/jwtAuth';

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth(req, 'permissions:manage');
    if (!auth.success) return auth.response;

    const { memberId: rawMemberId } = await context.params;
    const memberId = Number(rawMemberId);
    if (!memberId || isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Valid member ID is required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 500 }
      );
    }

    // 1. Fetch profile record
    const member = await db.query.profiles.findFirst({
      where: (m, { eq }) => eq(m.id, rawMemberId),
      with: {
        village: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found.' },
        { status: 404 }
      );
    }

    // 2. Fetch explicit permission overrides
    const userPerms = await db.query.userPermissions.findMany({
      where: (up, { eq }) => eq(up.userId, rawMemberId),
    });

    const isSuperAdmin = member.systemRole === 'SUPER_ADMIN';
    const roleDefaults = ROLE_DEFAULT_PERMISSIONS[member.systemRole] || [];

    const grantedOverrides = userPerms.filter((p) => p.isGranted).map((p) => p.permissionCode);
    const revokedOverrides = userPerms.filter((p) => !p.isGranted).map((p) => p.permissionCode);

    const effectivePermissions = isSuperAdmin
      ? ALL_SYSTEM_PERMISSIONS.map((p) => p.code)
      : Array.from(new Set([...roleDefaults, ...grantedOverrides])).filter(
          (code) => !revokedOverrides.includes(code)
        );

    return NextResponse.json({
      success: true,
      member: {
        id: String(member.id),
        name: member.fullName,
        mobile: member.mobile,
        role: member.systemRole === 'MEMBER' ? 'MEMBER' : 'ADMIN',
        systemRole: member.systemRole,
        villageId: member.villageId ? String(member.villageId) : '8',
      },
      isSuperAdmin,
      roleDefaults,
      grantedOverrides,
      revokedOverrides,
      effectivePermissions,
      rawOverrides: userPerms,
    });
  } catch (err: any) {
    console.error('Error fetching member permissions:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch member permissions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth(req, 'permissions:manage', 'ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { memberId: rawMemberId } = await context.params;
    const userId = rawMemberId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Valid member ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { permissions, grantedBy, grantedByMobile, reason } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Permissions array is required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 500 }
      );
    }

    // 1. Remove existing user permission overrides
    await db.delete(schema.userPermissions).where(eq(schema.userPermissions.userId, userId));

    // 2. Insert new overrides
    if (permissions.length > 0) {
      await db.insert(schema.userPermissions).values(
        permissions.map((p: any) => ({
          userId,
          permissionCode: p.code,
          isGranted: p.isGranted !== false,
          grantedBy: grantedBy || currentUser.name || 'Admin',
        }))
      );
    }

    logAuditAction(
      `Updated custom permissions for User ${userId} (${permissions.length} items)`,
      grantedBy || currentUser.name || 'Admin',
      grantedByMobile || currentUser.mobile || '',
      `User ${userId}`
    );

    return NextResponse.json({ success: true, count: permissions.length });
  } catch (err: any) {
    console.error('Error updating member permissions:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update member permissions' },
      { status: 500 }
    );
  }
}
