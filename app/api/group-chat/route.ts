import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { validateRequestBody, groupMessageSchema } from '@/src/lib/validations';

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, groupMessages: [] });

    const url = new URL(req.url);
    const villageIdParam = url.searchParams.get('villageId');
    const numericVillageId = villageIdParam && !isNaN(Number(villageIdParam)) ? Number(villageIdParam) : undefined;

    const rows = await db
      .select()
      .from(schema.chatMessages)
      .where(numericVillageId ? eq(schema.chatMessages.villageId, numericVillageId) : undefined)
      .orderBy(asc(schema.chatMessages.createdAt));

    const formatted = rows.map((m) => ({
      id: String(m.id),
      villageId: m.villageId ? String(m.villageId) : '8',
      senderName: m.senderName,
      senderRole: 'Member',
      senderMobile: m.senderMobile,
      senderPhoto: m.senderPhoto || '',
      text: m.text,
      timestamp: new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ success: true, groupMessages: formatted });
  } catch (err: any) {
    console.error('Error fetching group messages:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, groupMessageSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { senderName, senderRole = 'Member', senderMobile = '', senderPhoto = '', text, villageId } =
      validation.data;

    const db = getDb();
    if (!db) return NextResponse.json({ success: false, error: 'Database connection unavailable.' }, { status: 500 });

    let resolvedVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : undefined;

    // Automatically resolve village_id from logged-in sender
    if (senderMobile && !resolvedVillageId) {
      const cleanMob = senderMobile.replace(/\D/g, '').slice(-10);
      const matchedMember = await db.query.profiles.findFirst({
        where: (m, { sql }) => sql`RIGHT(REGEXP_REPLACE(${m.mobile}, '\\D', '', 'g'), 10) = ${cleanMob}`,
      });
      if (matchedMember?.villageId) {
        resolvedVillageId = matchedMember.villageId;
      }
    }

    const numericVillageId = resolvedVillageId || 8;
    const msgId = crypto.randomUUID();

    const [inserted] = await db
      .insert(schema.chatMessages)
      .values({
        id: msgId,
        roomId: 'general',
        villageId: numericVillageId,
        senderName: senderName.trim(),
        senderMobile: senderMobile.trim(),
        senderPhoto: senderPhoto.trim() || null,
        text: text.trim(),
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : '8',
      senderName: inserted.senderName,
      senderRole: senderRole,
      senderMobile: inserted.senderMobile,
      senderPhoto: inserted.senderPhoto,
      text: inserted.text,
      timestamp: new Date(inserted.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      createdAt: inserted.createdAt,
    };

    return NextResponse.json({ success: true, message: formatted });
  } catch (err: any) {
    console.error('Error posting group message:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to post message' }, { status: 500 });
  }
}
