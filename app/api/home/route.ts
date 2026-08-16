import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import {
  formatVillage,
  formatComplaint,
  formatSocialWork,
  formatEvent,
  formatGallery,
  formatAnnouncement,
} from '@/src/lib/apiResponse';

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const villageIdParam = url.searchParams.get('villageId');
    const numericVillageId = villageIdParam && !isNaN(Number(villageIdParam)) ? Number(villageIdParam) : 1;

    // Fetch page-specific data directly from database
    const [
      villagesData,
      announcementsData,
      eventsData,
      socialWorksData,
      galleryData,
      complaintsData,
      membersCount,
    ] = await Promise.all([
      db.query.villages.findMany({
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
        orderBy: [desc(schema.villages.id)],
      }),
      db
        .select()
        .from(schema.announcements)
        .orderBy(desc(schema.announcements.id))
        .limit(5),
      db
        .select()
        .from(schema.events)
        .orderBy(desc(schema.events.id))
        .limit(3),
      db
        .select()
        .from(schema.socialWorks)
        .orderBy(desc(schema.socialWorks.id))
        .limit(4),
      db
        .select()
        .from(schema.gallery)
        .orderBy(desc(schema.gallery.id))
        .limit(6),
      db
        .select()
        .from(schema.complaints)
        .orderBy(desc(schema.complaints.id))
        .limit(4),
      db.select().from(schema.profiles).catch(() => []),
    ]);

    const membersList = membersCount || [];

    const activeVillage = villagesData.find((v) => v.id === numericVillageId) || villagesData[0] || null;
    const formattedVillage = formatVillage(activeVillage);

    const stats = {
      totalMembers: membersList.length,
      activeMembers: membersList.filter((m: any) => m.status === 'active').length,
      totalEvents: eventsData.length,
      totalSocialWorks: socialWorksData.length,
      totalComplaints: complaintsData.length,
      resolvedComplaints: complaintsData.filter((c) => c.status === 'RESOLVED').length,
    };

    return NextResponse.json({
      success: true,
      page: 'home',
      village: formattedVillage,
      stats,
      announcements: announcementsData.map(formatAnnouncement).filter(Boolean),
      upcomingEvents: eventsData.map(formatEvent).filter(Boolean),
      recentSocialWorks: socialWorksData.map(formatSocialWork).filter(Boolean),
      galleryHighlights: galleryData.map(formatGallery).filter(Boolean),
      recentComplaints: complaintsData.map(formatComplaint).filter(Boolean),
    });
  } catch (error: any) {
    console.error('Error fetching home page API data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch home page data' },
      { status: 500 }
    );
  }
}
