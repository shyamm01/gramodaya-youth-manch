import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc } from 'drizzle-orm';
import {
  SYSTEM_MODULES,
  ALL_SYSTEM_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from '@/src/lib/permissions';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable.' },
        { status: 500 }
      );
    }

    const canonicalPermissions = await db
      .select()
      .from(schema.permissions)
      .orderBy(asc(schema.permissions.code));

    return NextResponse.json({
      success: true,
      modules: SYSTEM_MODULES,
      permissions: canonicalPermissions.length > 0 ? canonicalPermissions : ALL_SYSTEM_PERMISSIONS,
      roleTemplates: ROLE_DEFAULT_PERMISSIONS,
      totalPermissions: ALL_SYSTEM_PERMISSIONS.length,
      totalModules: SYSTEM_MODULES.length,
    });
  } catch (err: any) {
    console.error('Error fetching permissions catalog:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
