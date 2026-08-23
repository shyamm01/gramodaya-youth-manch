import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';
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
    if (!rawMemberId || rawMemberId.trim() === '') {
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

    // 2. Fetch all canonical modules
    const dbModules = await db
      .select()
      .from(schema.modules)
      .orderBy(asc(schema.modules.displayOrder));

    // 3. Fetch explicit user permissions from user_permissions table
    const userPerms = await db.query.userPermissions.findMany({
      where: (up, { eq }) => eq(up.userId, rawMemberId),
      with: {
        module: true,
      },
    });

    const isSuperAdmin = member.systemRole === 'SUPER_ADMIN';
    const isAdmin = member.systemRole === 'ADMIN';

    // 4. Construct Module CRUD Matrix
    const userPermMap = new Map<string, typeof userPerms[0]>();
    for (const up of userPerms) {
      userPermMap.set(String(up.moduleId), up);
    }

    const moduleCrudList = dbModules.map((mod) => {
      const existing = userPermMap.get(String(mod.id));
      if (isSuperAdmin) {
        return {
          moduleId: String(mod.id),
          moduleSlug: mod.slug,
          moduleName: mod.name,
          moduleNameHindi: mod.nameHindi,
          icon: mod.icon,
          description: mod.description,
          canRead: true,
          canWrite: true,
          canUpdate: true,
          canDelete: true,
          isCustom: false,
        };
      }

      if (existing) {
        return {
          moduleId: String(mod.id),
          moduleSlug: mod.slug,
          moduleName: mod.name,
          moduleNameHindi: mod.nameHindi,
          icon: mod.icon,
          description: mod.description,
          canRead: Boolean(existing.canRead),
          canWrite: Boolean(existing.canWrite),
          canUpdate: Boolean(existing.canUpdate),
          canDelete: Boolean(existing.canDelete),
          isCustom: true,
        };
      }

      // Default role presets
      const defaultRead = true; // All authenticated members can view public info/complaints
      const defaultWrite = isAdmin || ['complaints', 'gallery', 'chat'].includes(mod.slug);
      const defaultUpdate = isAdmin && mod.slug !== 'audit' && mod.slug !== 'settings';
      const defaultDelete = isAdmin && ['complaints', 'gallery', 'social_works', 'events'].includes(mod.slug);

      return {
        moduleId: String(mod.id),
        moduleSlug: mod.slug,
        moduleName: mod.name,
        moduleNameHindi: mod.nameHindi,
        icon: mod.icon,
        description: mod.description,
        canRead: defaultRead,
        canWrite: defaultWrite,
        canUpdate: defaultUpdate,
        canDelete: defaultDelete,
        isCustom: false,
      };
    });

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
      modules: moduleCrudList,
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
    const { modulePermissions, grantedBy, grantedByMobile, reason } = body;

    if (!Array.isArray(modulePermissions)) {
      return NextResponse.json(
        { success: false, error: 'modulePermissions array is required.' },
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

    // 1. Remove existing user module permissions
    await db.delete(schema.userPermissions).where(eq(schema.userPermissions.userId, userId));

    // 2. Insert new module CRUD permissions
    if (modulePermissions.length > 0) {
      const inserts = modulePermissions.map((mp: any) => ({
        userId,
        moduleId: Number(mp.moduleId),
        canRead: Boolean(mp.canRead),
        canWrite: Boolean(mp.canWrite),
        canUpdate: Boolean(mp.canUpdate),
        canDelete: Boolean(mp.canDelete),
        scopeType: (mp.scopeType || 'VILLAGE') as any,
        scopeId: mp.scopeId ? Number(mp.scopeId) : null,
        grantedBy: grantedBy || currentUser.name || 'Admin',
      }));

      await db.insert(schema.userPermissions).values(inserts);
    }

    logAuditAction(
      `Updated module CRUD permissions for User ${userId} (${modulePermissions.length} modules)`,
      grantedBy || currentUser.name || 'Admin',
      grantedByMobile || currentUser.mobile || '',
      `User ${userId}`
    );

    return NextResponse.json({ success: true, count: modulePermissions.length });
  } catch (err: any) {
    console.error('Error updating member permissions:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update member permissions' },
      { status: 500 }
    );
  }
}
