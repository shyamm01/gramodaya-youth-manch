import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { logAuditAction } from '@/src/lib/authUtils';
import { SYSTEM_MODULES, ALL_SYSTEM_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS } from '@/src/lib/permissions';
import { requireAuth } from '@/src/lib/jwtAuth';

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth(req);
    const { memberId: rawMemberId } = await context.params;
    if (!rawMemberId || rawMemberId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Valid member ID is required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    let dbModules: any[] = [];
    let member: any = null;
    let userPerms: any[] = [];

    if (db) {
      try {
        // 1. Fetch profile record
        member = await db.query.profiles.findFirst({
          where: (m, { eq }) => eq(m.id, rawMemberId),
          with: {
            village: true,
          },
        });
      } catch (err) {
        console.warn('Error fetching member profile from DB:', err);
      }

      try {
        // 2. Fetch canonical modules
        dbModules = await db
          .select()
          .from(schema.modules)
          .orderBy(asc(schema.modules.displayOrder));
      } catch (err) {
        console.warn('Error fetching modules from DB:', err);
      }

      if (member) {
        try {
          // 3. Fetch explicit user permissions from user_permissions table
          userPerms = await db.query.userPermissions.findMany({
            where: (up, { eq }) => eq(up.userId, rawMemberId),
            with: {
              module: true,
            },
          });
        } catch (err) {
          console.warn('Error fetching user_permissions from DB:', err);
        }
      }
    }

    // Fallback modules catalog if DB returned none
    const effectiveModules = dbModules.length > 0
      ? dbModules
      : SYSTEM_MODULES.map((m, idx) => ({
          id: idx + 1,
          slug: m.id,
          name: m.nameEnglish,
          nameHindi: m.nameHindi,
          description: m.description,
          icon: m.id === 'village' ? 'Building2' : m.id === 'members' ? 'Users' : 'Layers',
        }));

    const isSuperAdmin = member?.systemRole === 'SUPER_ADMIN' || member?.role === 'SUPER_ADMIN';
    const isAdmin = isSuperAdmin || member?.systemRole === 'ADMIN' || member?.role === 'ADMIN';

    // 4. Construct Module CRUD Matrix
    const userPermMap = new Map<string, any>();
    for (const up of userPerms) {
      userPermMap.set(String(up.moduleId), up);
      if (up.module?.slug) {
        userPermMap.set(up.module.slug, up);
      }
    }

    const moduleCrudList = effectiveModules.map((mod) => {
      const existing = userPermMap.get(String(mod.id)) || userPermMap.get(mod.slug);
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
      const defaultRead = true;
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
      member: member ? {
        id: String(member.id),
        name: member.fullName,
        mobile: member.mobile,
        role: member.systemRole === 'MEMBER' ? 'MEMBER' : 'ADMIN',
        systemRole: member.systemRole,
        villageId: member.villageId ? String(member.villageId) : '8',
      } : {
        id: rawMemberId,
        name: 'Member',
        mobile: '',
        role: 'MEMBER',
        systemRole: 'MEMBER',
        villageId: '8',
      },
      isSuperAdmin,
      modules: moduleCrudList,
      rawOverrides: userPerms,
    });
  } catch (err: any) {
    console.error('Error fetching member permissions matrix:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch member permissions' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth(req);
    const { memberId: rawMemberId } = await context.params;
    if (!rawMemberId || rawMemberId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Valid member ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { permissions, systemRole } = body;

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 500 }
      );
    }

    // 1. If systemRole update is requested
    if (systemRole && ['SUPER_ADMIN', 'ADMIN', 'MEMBER'].includes(systemRole)) {
      await db
        .update(schema.profiles)
        .set({ systemRole, updatedAt: new Date() })
        .where(eq(schema.profiles.id, rawMemberId));
    }

    // 2. If granular module CRUD matrix permissions are provided
    if (Array.isArray(permissions) && permissions.length > 0) {
      const allModules = await db.select().from(schema.modules);
      const modSlugMap = new Map<string, number>();
      for (const m of allModules) {
        modSlugMap.set(m.slug, m.id);
      }

      for (const p of permissions) {
        const resolvedModuleId = modSlugMap.get(p.moduleSlug) || Number(p.moduleId);
        if (!resolvedModuleId || isNaN(resolvedModuleId)) continue;

        // Upsert user_permissions record
        const existing = await db.query.userPermissions.findFirst({
          where: (up, { and, eq }) =>
            and(eq(up.userId, rawMemberId), eq(up.moduleId, resolvedModuleId)),
        });

        if (existing) {
          await db
            .update(schema.userPermissions)
            .set({
              canRead: Boolean(p.canRead),
              canWrite: Boolean(p.canWrite),
              canUpdate: Boolean(p.canUpdate),
              canDelete: Boolean(p.canDelete),
              grantedBy: auth.success ? auth.user.id : null,
              updatedAt: new Date(),
            })
            .where(eq(schema.userPermissions.id, existing.id));
        } else {
          await db.insert(schema.userPermissions).values({
            userId: rawMemberId,
            moduleId: resolvedModuleId,
            canRead: Boolean(p.canRead),
            canWrite: Boolean(p.canWrite),
            canUpdate: Boolean(p.canUpdate),
            canDelete: Boolean(p.canDelete),
            scopeType: 'GLOBAL',
            grantedBy: auth.success ? auth.user.id : null,
          });
        }
      }
    }

    // 3. Log Audit Trail
    await logAuditAction(
      'UPDATE_PERMISSIONS',
      auth.success ? auth.user.name : 'Super Admin',
      `Updated ${permissions?.length || 0} module permissions for user ${rawMemberId}`,
      `user:${rawMemberId}`
    );

    return NextResponse.json({
      success: true,
      message: 'User permissions matrix updated successfully.',
    });
  } catch (err: any) {
    console.error('Error saving user permissions matrix:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save permissions' },
      { status: 500 }
    );
  }
}
