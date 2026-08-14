import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, socialWorks: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        title, 
        description, 
        date, 
        location, 
        submitter_name as "submitterName", 
        submitter_mobile as "submitterMobile", 
        photo_url as "photoUrl", 
        video_url as "videoUrl", 
        status, 
        created_at as "createdAt"
      FROM public.social_works 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((s: any) => ({
      ...s,
      id: String(s.id),
      villageId: s.villageId ? String(s.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, socialWorks: formatted });
  } catch (err: any) {
    console.error('Error fetching social works:', err);
    return NextResponse.json({ error: 'Failed to fetch social works' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      date,
      location,
      submitterName,
      submitterMobile,
      photoUrl,
      videoUrl,
      villageId,
      status = 'pending',
      adminName,
      adminMobile,
    } = await req.json();

    if (!title || !description || !submitterName || !submitterMobile) {
      return NextResponse.json({ error: 'सभी आवश्यक विवरण भरें।' }, { status: 400 });
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
      INSERT INTO public.social_works (
        village_id,
        title,
        description,
        date,
        location,
        submitter_name,
        submitter_mobile,
        photo_url,
        video_url,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${title.trim()},
        ${description.trim()},
        ${date || sql`CURRENT_DATE`},
        ${location ? location.trim() : 'Rasoolpur'},
        ${submitterName.trim()},
        ${submitterMobile.trim()},
        ${photoUrl || null},
        ${videoUrl || null},
        ${(status || 'pending') as any},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newWork = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      title: inserted[0].title,
      description: inserted[0].description,
      date: inserted[0].date,
      location: inserted[0].location,
      submitterName: inserted[0].submitter_name,
      submitterMobile: inserted[0].submitter_mobile,
      photoUrl: inserted[0].photo_url || '',
      videoUrl: inserted[0].video_url || '',
      status: inserted[0].status,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Submitted Social Work (${newWork.title})`,
      adminName || submitterName || 'Public Portal',
      adminMobile || submitterMobile,
      newWork.title
    );

    return NextResponse.json({ success: true, socialWork: newWork }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting social work:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
