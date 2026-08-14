import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, announcements: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        title, 
        content, 
        published_by as "publishedBy", 
        is_urgent as "isUrgent", 
        date, 
        created_at as "createdAt"
      FROM public.announcements 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((a: any) => ({
      ...a,
      id: String(a.id),
      villageId: a.villageId ? String(a.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, announcements: formatted });
  } catch (err: any) {
    console.error('Error fetching announcements:', err);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      content,
      publishedBy = 'ग्रामोदय यूथ मंच',
      isUrgent = false,
      date,
      villageId,
      adminName,
      adminMobile,
    } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'सूचना का शीर्षक एवं विवरण आवश्यक है।' }, { status: 400 });
    }

    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ error: 'डेटाबेस अनुपलब्ध है।' }, { status: 500 });

    let numericVillageId: number | null = null;
    if (villageId && !isNaN(Number(villageId))) {
      numericVillageId = Number(villageId);
    } else {
      const found = await sql`SELECT id FROM public.villages LIMIT 1;`;
      if (found && found.length > 0) numericVillageId = found[0].id;
    }

    const inserted = await sql`
      INSERT INTO public.announcements (
        village_id,
        title,
        content,
        published_by,
        is_urgent,
        date,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${title.trim()},
        ${content.trim()},
        ${publishedBy},
        ${Boolean(isUrgent)},
        ${date || sql`CURRENT_DATE`},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newAnnouncement = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      title: inserted[0].title,
      content: inserted[0].content,
      publishedBy: inserted[0].published_by,
      isUrgent: inserted[0].is_urgent,
      date: inserted[0].date,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Published Announcement (${newAnnouncement.title})`,
      adminName || publishedBy,
      adminMobile,
      newAnnouncement.title
    );

    return NextResponse.json({ success: true, announcement: newAnnouncement }, { status: 201 });
  } catch (error: any) {
    console.error('Error publishing announcement:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
