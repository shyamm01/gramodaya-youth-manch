import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    const leaders = await db.query.members.findMany({
      where: (m, { or, eq }) =>
        or(
          eq(m.role, 'ADMIN'),
          eq(m.systemRole, 'ADMIN'),
          eq(m.systemRole, 'SUPER_ADMIN')
        ),
      with: {
        village: {
          with: {
            gramPanchayat: {
              with: {
                district: true,
              },
            },
          },
        },
      },
      orderBy: [desc(schema.members.id)],
    });

    const formattedLeaders = leaders.map((l) => {
      const v = l.village;
      const gp = v?.gramPanchayat;
      const dist = gp?.district;

      return {
        id: String(l.id),
        villageId: l.villageId ? String(l.villageId) : '1',
        name: l.name,
        mobile: l.mobile,
        photoUrl: l.photoUrl || '',
        designation:
          l.designation ||
          (l.systemRole === 'SUPER_ADMIN'
            ? 'केंद्रीय अध्यक्ष (Head Admin)'
            : 'ग्राम संयोजक (Village Coordinator)'),
        role: l.role,
        systemRole: l.systemRole,
        gramPanchayat: gp?.name || 'Bahera',
        village: v?.name || 'Rasoolpur',
        district: dist?.name || 'Hardoi',
        address: l.address || '',
        bloodGroup: l.bloodGroup || '',
        joinedAt: l.createdAt,
      };
    });

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
