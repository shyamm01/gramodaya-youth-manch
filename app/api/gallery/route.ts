import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, gallery: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        caption, 
        photo_url as "photoUrl", 
        uploaded_by as "uploadedBy", 
        uploaded_by_mobile as "uploadedByMobile", 
        date, 
        status, 
        created_at as "createdAt"
      FROM public.gallery 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((g: any) => ({
      ...g,
      id: String(g.id),
      villageId: g.villageId ? String(g.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, gallery: formatted });
  } catch (err: any) {
    console.error('Error fetching gallery:', err);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      caption,
      photoUrl,
      uploadedBy = 'Admin',
      uploadedByMobile,
      villageId,
      status = 'published',
      adminName,
      adminMobile,
    } = await req.json();

    if (!photoUrl) {
      return NextResponse.json({ error: 'फ़ोटो URL आवश्यक है।' }, { status: 400 });
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
      INSERT INTO public.gallery (
        village_id,
        caption,
        photo_url,
        uploaded_by,
        uploaded_by_mobile,
        date,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${caption ? caption.trim() : null},
        ${photoUrl},
        ${uploadedBy},
        ${uploadedByMobile || null},
        CURRENT_DATE,
        ${(status || 'published') as any},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newPhoto = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      caption: inserted[0].caption,
      photoUrl: inserted[0].photo_url,
      uploadedBy: inserted[0].uploaded_by,
      uploadedByMobile: inserted[0].uploaded_by_mobile,
      date: inserted[0].date,
      status: inserted[0].status,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Uploaded Gallery Photo (${newPhoto.caption || 'Photo'})`,
      adminName || uploadedBy,
      adminMobile || uploadedByMobile,
      newPhoto.caption || 'Gallery'
    );

    return NextResponse.json({ success: true, photo: newPhoto }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
