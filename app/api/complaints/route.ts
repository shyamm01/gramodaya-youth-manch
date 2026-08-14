import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction, normalizeMobile } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ success: true, complaints: [] });
    }

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        title, 
        category, 
        description, 
        location, 
        reporter_name as "reporterName", 
        reporter_mobile as "reporterMobile", 
        status, 
        photo_url as "photoUrl", 
        video_url as "videoUrl", 
        is_demo as "isDemo",
        resolved_at as "resolvedAt",
        created_at as "createdAt"
      FROM public.complaints 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((c: any) => ({
      ...c,
      id: String(c.id),
      villageId: c.villageId ? String(c.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, complaints: formatted });
  } catch (err: any) {
    console.error('Error fetching complaints from DB:', err);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      category,
      description,
      location,
      reporterName,
      reporterMobile,
      photoUrl,
      videoUrl,
      villageId,
      isDemo = false,
      adminName,
      adminMobile,
    } = await req.json();

    if (!title || !description || !reporterName || !reporterMobile) {
      return NextResponse.json({ error: 'सभी आवश्यक विवरण भरें।' }, { status: 400 });
    }

    const sql = getSqlClient();
    if (!sql) {
      return NextResponse.json({ error: 'डेटाबेस कनेक्शन अनुपलब्ध है।' }, { status: 500 });
    }

    // Resolve village ID
    let numericVillageId: number | null = null;
    if (villageId && !isNaN(Number(villageId))) {
      numericVillageId = Number(villageId);
    } else {
      const found = await sql`SELECT id FROM public.villages LIMIT 1;`;
      if (found && found.length > 0) numericVillageId = found[0].id;
    }

    const inserted = await sql`
      INSERT INTO public.complaints (
        village_id,
        title,
        category,
        description,
        location,
        reporter_name,
        reporter_mobile,
        status,
        photo_url,
        video_url,
        is_demo,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${title.trim()},
        ${(category || 'Other') as any},
        ${description.trim()},
        ${location ? location.trim() : 'Rasoolpur'},
        ${reporterName.trim()},
        ${reporterMobile.trim()},
        'NEW',
        ${photoUrl || null},
        ${videoUrl || null},
        ${Boolean(isDemo)},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newComplaint = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      title: inserted[0].title,
      category: inserted[0].category,
      description: inserted[0].description,
      location: inserted[0].location,
      reporterName: inserted[0].reporter_name,
      reporterMobile: inserted[0].reporter_mobile,
      status: inserted[0].status,
      photoUrl: inserted[0].photo_url || '',
      videoUrl: inserted[0].video_url || '',
      isDemo: inserted[0].is_demo,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Submitted Complaint (${newComplaint.title})`,
      adminName || reporterName || 'Public Portal',
      adminMobile || reporterMobile,
      newComplaint.title
    );

    return NextResponse.json({ success: true, complaint: newComplaint }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating complaint in DB:', error);
    return NextResponse.json(
      { error: error.message || 'शिकायत दर्ज करने में त्रुटि हुई।' },
      { status: 500 }
    );
  }
}
