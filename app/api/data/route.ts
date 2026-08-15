import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc, asc } from 'drizzle-orm';
import {
  formatVillage,
  formatMember,
  formatComplaint,
  formatSocialWork,
  formatEvent,
  formatGallery,
  formatElder,
  formatAnnouncement,
  formatPublicInfo,
  formatGroupMessage,
  formatAuditLog,
} from '@/src/lib/apiResponse';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection is not configured.' },
        { status: 500 }
      );
    }

    // Execute all queries in parallel via Drizzle ORM
    const [
      villagesData,
      membersData,
      complaintsData,
      socialWorksData,
      eventsData,
      galleryData,
      eldersData,
      announcementsData,
      publicInfosData,
      groupMessagesData,
      auditLogsData,
      permissionsData,
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
        orderBy: [asc(schema.villages.id)],
      }),
      db.query.members.findMany({
        with: {
          village: {
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
          },
        },
        orderBy: [desc(schema.members.id)],
      }),
      db.select().from(schema.complaints).orderBy(desc(schema.complaints.id)),
      db.select().from(schema.socialWorks).orderBy(desc(schema.socialWorks.id)),
      db.select().from(schema.events).orderBy(desc(schema.events.id)),
      db.select().from(schema.gallery).orderBy(desc(schema.gallery.id)),
      db.select().from(schema.elders).orderBy(desc(schema.elders.id)),
      db.select().from(schema.announcements).orderBy(desc(schema.announcements.id)),
      db.select().from(schema.publicInfos).orderBy(desc(schema.publicInfos.id)),
      db.select().from(schema.groupMessages).orderBy(asc(schema.groupMessages.id)),
      db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.id)).limit(50),
      db.select().from(schema.permissions).orderBy(asc(schema.permissions.code)),
    ]);

    const formattedVillages = villagesData.map(formatVillage).filter(Boolean);
    const formattedMembers = membersData.map(formatMember).filter(Boolean);
    const formattedComplaints = complaintsData.map(formatComplaint).filter(Boolean);
    const formattedSocialWorks = socialWorksData.map(formatSocialWork).filter(Boolean);
    const formattedEvents = eventsData.map(formatEvent).filter(Boolean);
    const formattedGallery = galleryData.map(formatGallery).filter(Boolean);
    const formattedElders = eldersData.map(formatElder).filter(Boolean);
    const formattedAnnouncements = announcementsData.map(formatAnnouncement).filter(Boolean);
    const formattedPublicInfos = publicInfosData.map(formatPublicInfo).filter(Boolean);
    const formattedGroupMessages = groupMessagesData.map(formatGroupMessage).filter(Boolean);
    const formattedAuditLogs = auditLogsData.map(formatAuditLog).filter(Boolean);

    const activeVillage = formattedVillages[0] || null;

    return NextResponse.json({
      success: true,
      villageSettings: activeVillage,
      villages: formattedVillages,
      members: formattedMembers,
      admins: formattedMembers.filter(
        (m: any) => m.systemRole === 'ADMIN' || m.systemRole === 'SUPER_ADMIN'
      ),
      complaints: formattedComplaints,
      socialWorks: formattedSocialWorks,
      publicInfos: formattedPublicInfos,
      announcements: formattedAnnouncements,
      events: formattedEvents,
      gallery: formattedGallery,
      elders: formattedElders,
      groupMessages: formattedGroupMessages,
      messages: [],
      auditLogs: formattedAuditLogs,
      permissions: permissionsData,
      apiIntegrations: [
        {
          id: 'int_supabase',
          name: 'PostgreSQL Database',
          status: 'Connected',
          keyMasked: 'postgresql_••••••••',
        },
      ],
      stats: {
        totalMembers: formattedMembers.length,
        activeMembers: formattedMembers.filter((m: any) => m.status === 'active').length,
        pendingMembers: formattedMembers.filter((m: any) => m.status === 'pending').length,
        totalComplaints: formattedComplaints.length,
        resolvedComplaints: formattedComplaints.filter((c: any) => c.status === 'RESOLVED').length,
        pendingComplaints: formattedComplaints.filter((c: any) => c.status !== 'RESOLVED').length,
        totalSocialWorks: formattedSocialWorks.length,
        totalEvents: formattedEvents.length,
        totalGallery: formattedGallery.length,
        totalElders: formattedElders.length,
        totalVillages: formattedVillages.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching data with Drizzle ORM:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
