import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    const villagesData = await sql`SELECT * FROM public.villages ORDER BY id ASC`;
    // Auto-ensure schema columns if not yet applied
    try {
      await sql`
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '241125';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Uttar Pradesh';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Hardoi';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS block TEXT DEFAULT 'Hardoi';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS gram_panchayat TEXT DEFAULT 'Bahera';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS village_name TEXT DEFAULT 'Rasoolpur';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS post_office TEXT DEFAULT 'Bahera Rasoolpur';
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS house_no TEXT;
        ALTER TABLE public.members ADD COLUMN IF NOT EXISTS street TEXT;
        ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '241125';
        ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS gram_panchayat_name TEXT DEFAULT 'Bahera';
        ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS district_name TEXT DEFAULT 'Hardoi';
        ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS state_name TEXT DEFAULT 'Uttar Pradesh';
        ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS block_name TEXT DEFAULT 'Hardoi';
        ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS post_office TEXT DEFAULT 'Bahera Rasoolpur';
      `;
    } catch (migErr) {
      // Ignored if permissions are restricted or columns already exist
    }

    const membersData = await sql`SELECT * FROM public.members ORDER BY id DESC`;
    const complaintsData = await sql`SELECT * FROM public.complaints ORDER BY id DESC`;
    const socialWorksData = await sql`SELECT * FROM public.social_works ORDER BY id DESC`;
    const eventsData = await sql`SELECT * FROM public.events ORDER BY id DESC`;
    const galleryData = await sql`SELECT * FROM public.gallery ORDER BY id DESC`;
    const eldersData = await sql`SELECT * FROM public.elders ORDER BY id DESC`;
    const announcementsData = await sql`SELECT * FROM public.announcements ORDER BY id DESC`;
    const publicInfosData = await sql`SELECT * FROM public.public_infos ORDER BY id DESC`;
    const groupMessagesData = await sql`SELECT * FROM public.group_messages ORDER BY id ASC`;
    const auditLogsData = await sql`SELECT * FROM public.audit_logs ORDER BY id DESC LIMIT 50`;
    const permissionsData = await sql`SELECT * FROM public.permissions ORDER BY id ASC`;

    // Format fields to camelCase for UI consumption
    const formattedVillages = villagesData.map((v: any) => ({
      id: String(v.id),
      slug: v.slug,
      name: v.name,
      nameHindi: v.name_hindi,
      gramPanchayatName: v.gram_panchayat_name || 'Bahera',
      gramPanchayatNameHindi: v.gram_panchayat_name_hindi || 'बहेरा',
      districtName: v.district_name || 'Hardoi',
      districtNameHindi: v.district_name_hindi || 'जौनपुर',
      stateName: v.state_name || 'Uttar Pradesh',
      stateNameHindi: v.state_name_hindi || 'उत्तर प्रदेश',
      blockName: v.block_name || 'Hardoi',
      blockNameHindi: v.block_name_hindi || 'शाहगंज',
      pincode: v.pincode || '241125',
      postOffice: v.post_office || 'Bahera Rasoolpur',
      orgName: v.org_name,
      orgNameHindi: v.org_name_hindi,
      sloganHindi: v.slogan_hindi,
      taglineHindi: v.tagline_hindi,
      isActive: v.is_active,
    }));

    const formattedMembers = membersData.map((m: any) => ({
      id: String(m.id),
      villageId: m.village_id ? String(m.village_id) : 'vil_rasoolpur',
      name: m.name,
      mobile: m.mobile,
      email: m.email || '',
      status: m.status,
      photoUrl: m.photo_url || '',
      organizationName: m.organization_name,
      fatherName: m.father_name || '',
      dob: m.dob || '',
      gender: m.gender || '',
      address: m.address || '',
      pincode: m.pincode || '241125',
      state: m.state || 'Uttar Pradesh',
      district: m.district || 'Hardoi',
      block: m.block || 'Hardoi',
      gramPanchayat: m.gram_panchayat || 'Bahera',
      villageName: m.village_name || 'Rasoolpur',
      postOffice: m.post_office || 'Bahera Rasoolpur',
      houseNo: m.house_no || '',
      street: m.street || '',
      occupation: m.occupation || '',
      designation: m.designation || '',
      politicalBackground: m.political_background || '',
      bloodGroup: m.blood_group || '',
      role: m.role || 'MEMBER',
      systemRole: m.system_role || 'MEMBER',
      createdAt: m.created_at,
    }));

    const formattedComplaints = complaintsData.map((c: any) => ({
      id: String(c.id),
      villageId: c.village_id ? String(c.village_id) : 'vil_rasoolpur',
      title: c.title,
      category: c.category,
      description: c.description,
      location: c.location,
      reporterName: c.reporter_name,
      reporterMobile: c.reporter_mobile,
      status: c.status,
      photoUrl: c.photo_url || '',
      videoUrl: c.video_url || '',
      createdAt: c.created_at,
      resolvedAt: c.resolved_at,
    }));

    const formattedSocialWorks = socialWorksData.map((s: any) => ({
      id: String(s.id),
      villageId: s.village_id ? String(s.village_id) : 'vil_rasoolpur',
      title: s.title,
      description: s.description,
      date: s.date,
      location: s.location,
      submitterName: s.submitter_name,
      submitterMobile: s.submitter_mobile,
      photoUrl: s.photo_url || '',
      videoUrl: s.video_url || '',
      status: s.status,
      createdAt: s.created_at,
    }));

    const formattedEvents = eventsData.map((e: any) => ({
      id: String(e.id),
      villageId: e.village_id ? String(e.village_id) : 'vil_rasoolpur',
      title: e.title,
      name: e.title,
      description: e.description,
      date: e.date,
      time: e.time,
      location: e.location,
      photoUrl: e.photo_url || '',
      status: e.status,
      createdAt: e.created_at,
    }));

    const formattedGallery = galleryData.map((g: any) => ({
      id: String(g.id),
      villageId: g.village_id ? String(g.village_id) : 'vil_rasoolpur',
      caption: g.caption,
      photoUrl: g.photo_url,
      uploadedBy: g.uploaded_by,
      uploadedByMobile: g.uploaded_by_mobile,
      date: g.date,
      status: g.status,
      createdAt: g.created_at,
    }));

    const formattedElders = eldersData.map((el: any) => ({
      id: String(el.id),
      villageId: el.village_id ? String(el.village_id) : 'vil_rasoolpur',
      name: el.name,
      age: el.age,
      role: el.role,
      contribution: el.contribution,
      photoUrl: el.photo_url,
      createdAt: el.created_at,
    }));

    const formattedAnnouncements = announcementsData.map((a: any) => ({
      id: String(a.id),
      villageId: a.village_id ? String(a.village_id) : 'vil_rasoolpur',
      title: a.title,
      content: a.content,
      publishedBy: a.published_by,
      isUrgent: a.is_urgent,
      date: a.date,
      createdAt: a.created_at,
    }));

    const formattedPublicInfos = publicInfosData.map((p: any) => ({
      id: String(p.id),
      villageId: p.village_id ? String(p.village_id) : 'vil_rasoolpur',
      title: p.title,
      description: p.description,
      category: p.category,
      submitterName: p.submitter_name,
      submitterMobile: p.submitter_mobile,
      status: p.status,
      createdAt: p.created_at,
    }));

    const formattedGroupMessages = groupMessagesData.map((gm: any) => ({
      id: String(gm.id),
      villageId: gm.village_id ? String(gm.village_id) : 'vil_rasoolpur',
      senderName: gm.sender_name,
      senderRole: gm.sender_role,
      senderMobile: gm.sender_mobile,
      senderPhoto: gm.sender_photo,
      text: gm.text,
      createdAt: gm.created_at,
    }));

    const formattedAuditLogs = auditLogsData.map((al: any) => ({
      id: String(al.id),
      action: al.action,
      adminName: al.user_name,
      adminMobile: '',
      recordAffected: al.details || '',
      timestamp: al.timestamp,
    }));

    const village = formattedVillages[0] || {
      id: 'vil_rasoolpur',
      name: 'Rasoolpur',
      nameHindi: 'रसूलपुर',
      gramPanchayat: 'Bahera',
      gramPanchayatHindi: 'बहेरा',
      district: 'Hardoi',
      districtHindi: 'जौनपुर',
      state: 'Uttar Pradesh',
      stateHindi: 'उत्तर प्रदेश',
      tagline: 'Empowering Village Youth',
      taglineHindi: 'युवा शक्ति से ग्रामोदय की ओर',
      slogan: 'Youth Power • Village Progress • Bright Future',
      sloganHindi: 'युवा शक्ति • ग्राम विकास • उज्ज्वल भविष्य',
      orgName: 'Gramodaya Youth Manch',
      orgNameHindi: 'ग्रामोदय यूथ मंच',
    };

    return NextResponse.json({
      villageSettings: village,
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
          name: 'PostgreSQL Supabase',
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
    console.error('Error fetching data from Postgres:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}
