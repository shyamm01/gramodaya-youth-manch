import { NextResponse } from 'next/server';
import { getSqlClient, logAuditAction } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, elders: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        name, 
        age, 
        role, 
        contribution, 
        photo_url as "photoUrl", 
        created_at as "createdAt"
      FROM public.elders 
      ORDER BY id DESC;
    `;

    const formatted = rows.map((e: any) => ({
      ...e,
      id: String(e.id),
      villageId: e.villageId ? String(e.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, elders: formatted });
  } catch (err: any) {
    console.error('Error fetching elders:', err);
    return NextResponse.json({ error: 'Failed to fetch elders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      name,
      age,
      role,
      contribution,
      photoUrl,
      villageId,
      adminName,
      adminMobile,
    } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'बुजुर्ग का नाम आवश्यक है।' }, { status: 400 });
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
      INSERT INTO public.elders (
        village_id,
        name,
        age,
        role,
        contribution,
        photo_url,
        created_at,
        updated_at
      ) VALUES (
        ${numericVillageId},
        ${name.trim()},
        ${age || null},
        ${role || null},
        ${contribution || null},
        ${photoUrl || null},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const newElder = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      name: inserted[0].name,
      age: inserted[0].age,
      role: inserted[0].role,
      contribution: inserted[0].contribution,
      photoUrl: inserted[0].photo_url,
      createdAt: inserted[0].created_at,
    };

    logAuditAction(
      `Added Elder Honor Record (${newElder.name})`,
      adminName || 'Admin',
      adminMobile,
      newElder.name
    );

    return NextResponse.json({ success: true, elder: newElder }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding elder:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
