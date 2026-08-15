import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc, eq, and } from 'drizzle-orm';

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

    // Fetch page-specific data in parallel
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
      db.select().from(schema.events)
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
      db.select().from(schema.members),
    ]);

    const activeVillage = villagesData.find((v) => v.id === numericVillageId) || villagesData[0];
    const gp = activeVillage?.gramPanchayat;
    const dist = gp?.district;
    const st = dist?.state;

    const formattedVillage = {
      id: String(activeVillage?.id || 1),
      slug: activeVillage?.slug || 'rasoolpur',
      name: activeVillage?.name || 'Rasoolpur',
      nameHindi: activeVillage?.nameHindi || 'रसूलपुर',
      gramPanchayatName: gp?.name || 'Bahera',
      gramPanchayatNameHindi: gp?.nameHindi || 'बहेरा',
      districtName: dist?.name || 'Hardoi',
      districtNameHindi: dist?.nameHindi || 'हरदोई',
      stateName: st?.name || 'Uttar Pradesh',
      stateNameHindi: st?.nameHindi || 'उत्तर प्रदेश',
      blockName: activeVillage?.blockName || gp?.blockName || 'Hardoi',
      blockNameHindi: activeVillage?.blockNameHindi || gp?.blockNameHindi || 'हरदोई',
      pincode: activeVillage?.pincode || gp?.pincode || '241125',
      postOffice: activeVillage?.postOffice || gp?.postOffice || 'Bahera Rasoolpur',
      orgName: activeVillage?.orgName || 'Gramodaya Youth Manch',
      orgNameHindi: activeVillage?.orgNameHindi || 'ग्रामोदय यूथ मंच',
      sloganHindi: activeVillage?.sloganHindi || 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
      taglineHindi: activeVillage?.taglineHindi || 'युवा शक्ति से ग्रामोदय की ओर',
      orgPurposeHindi: activeVillage?.orgPurposeHindi,
    };

    const stats = {
      totalMembers: membersCount.length,
      activeMembers: membersCount.filter((m) => m.status === 'active').length,
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
      announcements: announcementsData.map((a) => ({
        id: String(a.id),
        title: a.title,
        content: a.content,
        publishedBy: a.publishedBy,
        isUrgent: a.isUrgent,
        date: a.date,
        createdAt: a.createdAt,
      })),
      upcomingEvents: eventsData.map((e) => ({
        id: String(e.id),
        title: e.title,
        name: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        photoUrl: e.photoUrl,
        status: e.status,
      })),
      recentSocialWorks: socialWorksData.map((s) => ({
        id: String(s.id),
        title: s.title,
        description: s.description,
        date: s.date,
        location: s.location,
        submitterName: s.submitterName,
        photoUrl: s.photoUrl,
        status: s.status,
      })),
      galleryHighlights: galleryData.map((g) => ({
        id: String(g.id),
        photoUrl: g.photoUrl,
        caption: g.caption,
        date: g.date,
      })),
      recentComplaints: complaintsData.map((c) => ({
        id: String(c.id),
        title: c.title,
        category: c.category,
        status: c.status,
        location: c.location,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching home page API data:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch home page data' },
      { status: 500 }
    );
  }
}
