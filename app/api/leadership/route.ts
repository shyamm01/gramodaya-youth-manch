import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc, or, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    const leaders = await db
      .select()
      .from(schema.members)
      .where(
        or(
          eq(schema.members.role, 'ADMIN'),
          eq(schema.members.systemRole, 'ADMIN'),
          eq(schema.members.systemRole, 'SUPER_ADMIN')
        )
      )
      .orderBy(desc(schema.members.id));

    const formattedLeaders = leaders.map((l) => ({
      id: String(l.id),
      villageId: l.villageId ? String(l.villageId) : '1',
      name: l.name,
      mobile: l.mobile,
      photoUrl: l.photoUrl || '',
      designation: l.designation || (l.systemRole === 'SUPER_ADMIN' ? 'केंद्रीय अध्यक्ष (Head Admin)' : 'ग्राम संयोजक (Village Coordinator)'),
      role: l.role,
      systemRole: l.systemRole,
      gramPanchayat: l.gramPanchayat || 'Bahera',
      village: l.villageName || 'Rasoolpur',
      district: l.district || 'Hardoi',
      address: l.address || '',
      bloodGroup: l.bloodGroup || '',
      joinedAt: l.createdAt,
    }));

    return NextResponse.json({
      success: true,
      page: 'leadership',
      leadership: formattedLeaders,
    });
  } catch (error: any) {
    console.error('Error fetching leadership page data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch leadership data' },
      { status: 500 }
    );
  }
}
