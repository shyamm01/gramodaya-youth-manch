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

    // 1. Query profiles table for leadership
    let profileLeaders: any[] = [];
    try {
      profileLeaders = await db.query.profiles.findMany({
        where: (p, { or, eq }) =>
          or(
            eq(p.systemRole, 'ADMIN'),
            eq(p.systemRole, 'SUPER_ADMIN')
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
        orderBy: [desc(schema.profiles.createdAt)],
      });
    } catch (e) {
      console.warn('Profiles leadership query notice:', e);
    }

    if (profileLeaders && profileLeaders.length > 0) {
      const formatted = profileLeaders.map((l) => {
        const v = l.village;
        const gp = v?.gramPanchayat;
        const dist = gp?.district;

        return {
          id: String(l.id),
          villageId: l.villageId ? String(l.villageId) : '1',
          name: l.fullName || 'Admin',
          mobile: l.mobile || '',
          photoUrl: l.photoUrl || l.avatarUrl || '',
          designation:
            l.designation ||
            (l.systemRole === 'SUPER_ADMIN'
              ? 'केंद्रीय अध्यक्ष (Head Admin)'
              : 'ग्राम संयोजक (Village Coordinator)'),
          role: l.role || 'ADMIN',
          systemRole: l.systemRole || 'ADMIN',
          gramPanchayat: l.gramPanchayat || gp?.name || 'Bahera',
          village: l.villageName || v?.name || 'Rasoolpur',
          district: l.district || dist?.name || 'Hardoi',
          address: l.address || '',
          bloodGroup: l.bloodGroup || '',
          joinedAt: l.createdAt,
        };
      });

      return NextResponse.json({
        success: true,
        page: 'leadership',
        leadership: formatted,
      });
    }

    // 2. Fallback: Query legacy members table
    const leaders = await db.query.members.findMany({
      where: (m, { or, eq }) =>
        or(
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
      orderBy: [desc(schema.profiles.createdAt)],
    });

    const formattedLeaders = leaders.map((l: any) => {
      const v = l.village;
      const gp = v?.gramPanchayat;
      const dist = gp?.district;

      return {
        id: String(l.id),
        villageId: l.villageId ? String(l.villageId) : '8',
        name: l.fullName || l.name || 'Leader',
        mobile: l.mobile,
        photoUrl: l.avatarUrl || l.photoUrl || '',
        designation:
          l.designation ||
          (l.systemRole === 'SUPER_ADMIN'
            ? 'केंद्रीय अध्यक्ष (Head Admin)'
            : 'ग्राम संयोजक (Village Coordinator)'),
        role: l.role,
        systemRole: l.systemRole,
        gramPanchayat: gp?.nameHindi || gp?.name || 'Bahera',
        village: v?.nameHindi || v?.name || 'Rasoolpur',
        district: dist?.nameHindi || dist?.name || 'Hardoi',
        address: l.houseNo ? `${l.houseNo}, ${v?.name || 'Rasoolpur'}` : `${v?.name || 'Rasoolpur'}, ${gp?.name || 'Bahera'}`,
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
