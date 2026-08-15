import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { desc, asc } from 'drizzle-orm';

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
      db.select().from(schema.members).orderBy(desc(schema.members.id)),
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

    // Format relational village records
    const formattedVillages = villagesData.map((v) => {
      const gp = v.gramPanchayat;
      const dist = gp?.district;
      const st = dist?.state;

      return {
        id: String(v.id),
        slug: v.slug,
        name: v.name,
        nameHindi: v.nameHindi,
        gramPanchayatId: v.gramPanchayatId ? String(v.gramPanchayatId) : undefined,
        gramPanchayatName: gp?.name || 'Bahera',
        gramPanchayatNameHindi: gp?.nameHindi || 'बहेरा',
        districtId: dist ? String(dist.id) : undefined,
        districtName: dist?.name || 'Hardoi',
        districtNameHindi: dist?.nameHindi || 'हरदोई',
        stateId: st ? String(st.id) : undefined,
        stateName: st?.name || 'Uttar Pradesh',
        stateNameHindi: st?.nameHindi || 'उत्तर प्रदेश',
        blockName: v.blockName || gp?.blockName || 'Hardoi',
        blockNameHindi: v.blockNameHindi || gp?.blockNameHindi || 'हरदोई',
        pincode: v.pincode || gp?.pincode || '241125',
        postOffice: v.postOffice || gp?.postOffice || 'Bahera Rasoolpur',
        orgName: v.orgName,
        orgNameHindi: v.orgNameHindi,
        sloganHindi: v.sloganHindi,
        taglineHindi: v.taglineHindi,
        orgPurposeHindi: v.orgPurposeHindi,
        contactMobile: v.contactMobile,
        contactEmail: v.contactEmail,
        bannerPhotoUrl: v.bannerPhotoUrl,
        isActive: v.isActive,
      };
    });

    // Format member records
    const formattedMembers = membersData.map((m) => ({
      id: String(m.id),
      villageId: m.villageId ? String(m.villageId) : '1',
      name: m.name,
      mobile: m.mobile,
      email: m.email || '',
      status: m.status,
      photoUrl: m.photoUrl || '',
      organizationName: m.organizationName || 'ग्रामोदय यूथ मंच',
      fatherName: m.fatherName || '',
      dob: m.dob || '',
      gender: m.gender || '',
      address: m.address || '',
      pincode: m.pincode || '241125',
      state: m.state || 'Uttar Pradesh',
      district: m.district || 'Hardoi',
      block: m.block || 'Hardoi',
      gramPanchayat: m.gramPanchayat || 'Bahera',
      villageName: m.villageName || 'Rasoolpur',
      postOffice: m.postOffice || 'Bahera Rasoolpur',
      houseNo: m.houseNo || '',
      street: m.street || '',
      occupation: m.occupation || '',
      designation: m.designation || '',
      politicalBackground: m.politicalBackground || '',
      bloodGroup: m.bloodGroup || '',
      role: m.role || 'MEMBER',
      systemRole: m.systemRole || 'MEMBER',
      createdAt: m.createdAt,
    }));

    // Format complaints
    const formattedComplaints = complaintsData.map((c) => ({
      id: String(c.id),
      villageId: c.villageId ? String(c.villageId) : '1',
      title: c.title,
      category: c.category,
      description: c.description,
      location: c.location,
      reporterName: c.reporterName,
      reporterMobile: c.reporterMobile,
      status: c.status,
      photoUrl: c.photoUrl || '',
      videoUrl: c.videoUrl || '',
      createdAt: c.createdAt,
      resolvedAt: c.resolvedAt,
    }));

    // Format social works
    const formattedSocialWorks = socialWorksData.map((s) => ({
      id: String(s.id),
      villageId: s.villageId ? String(s.villageId) : '1',
      title: s.title,
      description: s.description,
      date: s.date,
      location: s.location,
      submitterName: s.submitterName,
      submitterMobile: s.submitterMobile,
      photoUrl: s.photoUrl || '',
      videoUrl: s.videoUrl || '',
      status: s.status,
      createdAt: s.createdAt,
    }));

    // Format events
    const formattedEvents = eventsData.map((e) => ({
      id: String(e.id),
      villageId: e.villageId ? String(e.villageId) : '1',
      title: e.title,
      name: e.title,
      description: e.description || '',
      date: e.date,
      time: e.time,
      location: e.location,
      photoUrl: e.photoUrl || '',
      videoUrl: e.videoUrl || '',
      status: e.status,
      createdAt: e.createdAt,
    }));

    // Format gallery items
    const formattedGallery = galleryData.map((g) => ({
      id: String(g.id),
      villageId: g.villageId ? String(g.villageId) : '1',
      caption: g.caption || '',
      photoUrl: g.photoUrl,
      uploadedBy: g.uploadedBy,
      uploadedByMobile: g.uploadedByMobile || '',
      date: g.date,
      status: g.status,
      createdAt: g.createdAt,
    }));

    // Format elders
    const formattedElders = eldersData.map((el) => ({
      id: String(el.id),
      villageId: el.villageId ? String(el.villageId) : '1',
      name: el.name,
      age: el.age || '',
      role: el.role || '',
      contribution: el.contribution || '',
      photoUrl: el.photoUrl || '',
      createdAt: el.createdAt,
    }));

    // Format announcements
    const formattedAnnouncements = announcementsData.map((a) => ({
      id: String(a.id),
      villageId: a.villageId ? String(a.villageId) : '1',
      title: a.title,
      content: a.content,
      publishedBy: a.publishedBy,
      isUrgent: a.isUrgent || false,
      date: a.date,
      createdAt: a.createdAt,
    }));

    // Format public infos
    const formattedPublicInfos = publicInfosData.map((p) => ({
      id: String(p.id),
      villageId: p.villageId ? String(p.villageId) : '1',
      title: p.title,
      description: p.description,
      category: p.category,
      submitterName: p.submitterName,
      submitterMobile: p.submitterMobile,
      status: p.status,
      createdAt: p.createdAt,
    }));

    // Format group chat messages
    const formattedGroupMessages = groupMessagesData.map((gm) => ({
      id: String(gm.id),
      villageId: gm.villageId ? String(gm.villageId) : '1',
      senderName: gm.senderName,
      senderRole: gm.senderRole || 'Member',
      senderMobile: gm.senderMobile || '',
      senderPhoto: gm.senderPhoto || '',
      text: gm.text,
      createdAt: gm.createdAt,
    }));

    // Format audit logs
    const formattedAuditLogs = auditLogsData.map((al) => ({
      id: String(al.id),
      action: al.action,
      adminName: al.userName,
      adminMobile: '',
      recordAffected: al.details || '',
      timestamp: al.timestamp,
    }));

    const activeVillage = formattedVillages[0] || {
      id: '1',
      slug: 'rasoolpur',
      name: 'Rasoolpur',
      nameHindi: 'रसूलपुर',
      gramPanchayat: 'Bahera',
      gramPanchayatHindi: 'बहेरा',
      district: 'Hardoi',
      districtHindi: 'हरदोई',
      state: 'Uttar Pradesh',
      stateHindi: 'उत्तर प्रदेश',
      tagline: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
      taglineHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
      slogan: 'युवा शक्ति से ग्रामोदय की ओर',
      sloganHindi: 'युवा शक्ति से ग्रामोदय की ओर',
      orgName: 'Gramodaya Youth Manch',
      orgNameHindi: 'ग्रामोदय यूथ मंच',
    };

    return NextResponse.json({
      success: true,
      villageSettings: activeVillage,
      villages: formattedVillages,
      members: formattedMembers,
      admins: formattedMembers.filter(
        (m) => m.systemRole === 'ADMIN' || m.systemRole === 'SUPER_ADMIN'
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
        activeMembers: formattedMembers.filter((m) => m.status === 'active').length,
        pendingMembers: formattedMembers.filter((m) => m.status === 'pending').length,
        totalComplaints: formattedComplaints.length,
        resolvedComplaints: formattedComplaints.filter((c) => c.status === 'RESOLVED').length,
        pendingComplaints: formattedComplaints.filter((c) => c.status !== 'RESOLVED').length,
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
