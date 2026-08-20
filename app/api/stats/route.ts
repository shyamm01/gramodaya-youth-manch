import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { count, eq } from 'drizzle-orm';
import { formatVillage } from '@/src/lib/apiResponse';
import { resolveVillageId, createTtlCache } from '@/src/lib/villageContext';

// Generic, village-scoped aggregate counts — not specific to any one page.
// Any dashboard/section needing "how many members/events/etc." reads from
// here instead of computing counts from a possibly-truncated list.

const villageQuery = {
  with: {
    gramPanchayat: {
      with: {
        district: {
          with: {
            state: true,
          },
        },
      },
    },
  },
} as const;

const cache = createTtlCache<Awaited<ReturnType<typeof computeStats>>>(30_000);

async function computeStats(villageId: number) {
  const db = getDb();
  if (!db) {
    throw new Error('Database connection is not configured.');
  }

  const [
    activeVillage,
    totalMembersRow,
    activeMembersRow,
    totalEventsRow,
    totalSocialWorksRow,
    totalComplaintsRow,
    newComplaintsRow,
    resolvedComplaintsRow,
  ] = await Promise.all([
    db.query.villages.findFirst({ where: eq(schema.villages.id, villageId), ...villageQuery }),
    db.select({ value: count() }).from(schema.profiles).catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(schema.profiles)
      .where(eq(schema.profiles.status, 'active'))
      .catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(schema.events),
    db.select({ value: count() }).from(schema.socialWorks),
    db.select({ value: count() }).from(schema.complaints),
    db.select({ value: count() }).from(schema.complaints).where(eq(schema.complaints.status, 'NEW')),
    db
      .select({ value: count() })
      .from(schema.complaints)
      .where(eq(schema.complaints.status, 'RESOLVED')),
  ]);

  const resolvedVillage = activeVillage || (await db.query.villages.findFirst(villageQuery)) || null;

  return {
    success: true,
    village: formatVillage(resolvedVillage),
    stats: {
      totalMembers: totalMembersRow[0]?.value ?? 0,
      activeMembers: activeMembersRow[0]?.value ?? 0,
      totalEvents: totalEventsRow[0]?.value ?? 0,
      totalSocialWorks: totalSocialWorksRow[0]?.value ?? 0,
      totalComplaints: totalComplaintsRow[0]?.value ?? 0,
      newComplaints: newComplaintsRow[0]?.value ?? 0,
      resolvedComplaints: resolvedComplaintsRow[0]?.value ?? 0,
    },
  };
}

export async function GET(req: Request) {
  try {
    const villageId = await resolveVillageId(req);
    const cached = cache.get(villageId);
    if (cached) return NextResponse.json(cached);

    const data = await computeStats(villageId);
    cache.set(villageId, data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
