import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, events: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        title, 
        title as name,
        description, 
        date, 
        time, 
        location, 
        photo_url as "photoUrl", 
        video_url as "videoUrl", 
        status, 
        created_at as "createdAt"
      FROM public.events 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((e: any) => ({
      ...e,
      id: String(e.id),
      villageId: e.villageId ? String(e.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, events: formatted });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      name,
      description,
      date,
      time = '10:00 AM',
      location = 'Rasoolpur Village',
      photoUrl,
      videoUrl,
      villageId,
      status = 'PUBLISHED',
      adminName,
      adminMobile,
    } = await req.json();

    const eventTitle = (title || name || '').trim();
    if (!eventTitle || !date) {
      return NextResponse.json({ error: 'कार्यक्रम का शीर्षक एवं दिनांक आवश्यक है।' }, { status: 400 });
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
      INSERT INTO public.events (
        village_id,
        title,
        description,
        date,
        time,
        location,
        photo_url,
        video_url,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${eventTitle},
        ${description ? description.trim() : null},
        ${date},
        ${time},
        ${location},
        ${photoUrl || null},
        ${videoUrl || null},
        ${status as any},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newEvent = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      title: inserted[0].title,
      name: inserted[0].title,
      description: inserted[0].description,
      date: inserted[0].date,
      time: inserted[0].time,
      location: inserted[0].location,
      photoUrl: inserted[0].photo_url || '',
      status: inserted[0].status,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Created Event (${newEvent.title})`,
      adminName || 'Admin',
      adminMobile,
      newEvent.title
    );

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
