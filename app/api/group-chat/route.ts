import { NextResponse } from 'next/server';
import { getSqlClient } from '@/src/lib/authUtils';

export async function GET() {
  try {
    const sql = getSqlClient();
    if (!sql) return NextResponse.json({ success: true, groupMessages: [] });

    const rows = await sql`
      SELECT 
        id, 
        village_id as "villageId",
        sender_name as "senderName", 
        sender_role as "senderRole", 
        sender_mobile as "senderMobile", 
        sender_photo as "senderPhoto", 
        text, 
        timestamp, 
        created_at as "createdAt"
      FROM public.group_messages 
      ORDER BY id ASC;
    `;

    const formatted = rows.map((m: any) => ({
      ...m,
      id: String(m.id),
      villageId: m.villageId ? String(m.villageId) : 'vil_rasoolpur',
    }));

    return NextResponse.json({ success: true, groupMessages: formatted });
  } catch (err: any) {
    console.error('Error fetching group messages:', err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { senderName, senderRole = 'Member', senderMobile, senderPhoto, text, villageId } =
      await req.json();

    if (!text || !senderName) {
      return NextResponse.json({ error: 'संदेश एवं प्रेषक का नाम आवश्यक है।' }, { status: 400 });
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

    const nowStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const inserted = await sql`
      INSERT INTO public.group_messages (
        village_id,
        sender_name,
        sender_role,
        sender_mobile,
        sender_photo,
        text,
        timestamp,
        created_at
      ) VALUES (
        ${numericVillageId},
        ${senderName},
        ${senderRole},
        ${senderMobile || null},
        ${senderPhoto || null},
        ${text.trim()},
        ${nowStr},
        NOW()
      )
      RETURNING *;
    `;

    const newMsg = {
      id: String(inserted[0].id),
      villageId: inserted[0].village_id ? String(inserted[0].village_id) : 'vil_rasoolpur',
      senderName: inserted[0].sender_name,
      senderRole: inserted[0].sender_role,
      senderMobile: inserted[0].sender_mobile,
      senderPhoto: inserted[0].sender_photo,
      text: inserted[0].text,
      timestamp: inserted[0].timestamp,
      createdAt: inserted[0].created_at,
    };

    return NextResponse.json({ success: true, groupMessage: newMsg }, { status: 201 });
  } catch (error: any) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: error.message || 'त्रुटि हुई।' }, { status: 500 });
  }
}
