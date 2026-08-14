import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, publicInfos: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        title, 
        description, 
        category, 
        submitter_name as "submitterName", 
        submitter_mobile as "submitterMobile", 
        status, 
        created_at as "createdAt"
      FROM public.public_infos 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((p: any) => ({
      ...p,
      id: String(p.id),
      villageId: p.villageId ? String(p.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, publicInfos: formatted });
  } catch (err: any) {
    console.error('Error fetching public info:', err);
    return NextResponse.json({ error: 'Failed to fetch public info' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      category,
      submitterName,
      submitterMobile,
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
      INSERT INTO public.public_infos (
        village_id,
        title,
        description,
        category,
        submitter_name,
        submitter_mobile,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${title.trim()},
        ${description.trim()},
        ${category ? category.trim() : 'General'},
        ${submitterName.trim()},
        ${submitterMobile.trim()},
        ${(status || 'pending') as any},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newInfo = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      title: inserted[0].title,
      description: inserted[0].description,
      category: inserted[0].category,
      submitterName: inserted[0].submitter_name,
      submitterMobile: inserted[0].submitter_mobile,
      status: inserted[0].status,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Submitted Public Information (${newInfo.title})`,
      adminName || submitterName || 'Public Portal',
      adminMobile || submitterMobile,
      newInfo.title
    );

    return NextResponse.json({ success: true, publicInfo: newInfo }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting public info:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
