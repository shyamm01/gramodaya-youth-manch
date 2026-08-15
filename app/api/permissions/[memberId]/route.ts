import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { logAuditAction } from '@/src/lib/authUtils';
import { ALL_SYSTEM_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@/src/lib/permissions';

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
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

    // 1. Fetch member record
    const member = await db.query.members.findFirst({
      where: (m, { eq }) => eq(m.id, memberId),
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
      where: (up, { eq }) => eq(up.memberId, memberId),
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
        name: member.name,
        mobile: member.mobile,
        role: member.role,
        systemRole: member.systemRole,
        villageId: member.villageId ? String(member.villageId) : '1',
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
    const { memberId: rawMemberId } = await context.params;
    const memberId = Number(rawMemberId);
    if (!memberId || isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Valid member ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      permissions: permissionCodes,
      adminName = 'Super Admin',
      adminMobile = '',
      scopeType = 'VILLAGE',
      scopeId,
    } = body;

    if (!Array.isArray(permissionCodes)) {
      return NextResponse.json(
        { success: false, error: 'Permissions must be an array of permission codes.' },
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

    // 1. Verify member exists
    const member = await db.query.members.findFirst({
      where: (m, { eq }) => eq(m.id, memberId),
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found.' },
        { status: 404 }
      );
    }

    // 2. Clear existing user permission overrides for clean sync
    await db.delete(schema.userPermissions).where(eq(schema.userPermissions.memberId, memberId));

    // 3. Insert updated permission overrides
    if (permissionCodes.length > 0) {
      const insertRecords = permissionCodes.map((code: string) => ({
        memberId,
        permissionCode: code,
        scopeType: (scopeType as any) || 'VILLAGE',
        scopeId: scopeId ? Number(scopeId) : member.villageId,
        isGranted: true,
        grantedBy: adminName,
      }));

      await db.insert(schema.userPermissions).values(insertRecords);
    }

    await logAuditAction(
      `सदस्य अनुमतियां अपडेट की गईं: ${member.name} (${permissionCodes.length} अनुमतियां)`,
      adminName,
      `Mobile: ${adminMobile}`
    );

    return NextResponse.json({
      success: true,
      message: `Permissions updated successfully for ${member.name}`,
      totalPermissions: permissionCodes.length,
    });
  } catch (err: any) {
    console.error('Error updating member permissions:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
