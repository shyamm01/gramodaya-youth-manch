import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { validateRequestBody, groupMessageSchema } from '@/src/lib/validations';

/**
 * chat_messages no longer stores a copy of the sender's name, mobile and photo
 * on every row — it carries sender_id and the profile is joined here. The wire
 * format is unchanged, so clients keep reading senderName / senderMobile /
 * senderPhoto, but they now reflect the sender's *current* profile instead of
 * whatever it happened to be when the message was posted.
 */
const ANONYMOUS_SENDER = 'पूर्व सदस्य';

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, groupMessages: [] });

    const url = new URL(req.url);
    const villageIdParam = url.searchParams.get('villageId');
    const numericVillageId = villageIdParam && !isNaN(Number(villageIdParam)) ? Number(villageIdParam) : undefined;

    const rows = await db
      .select({
        message: schema.chatMessages,
        senderName: schema.profiles.fullName,
        senderMobile: schema.profiles.mobile,
        senderPhoto: schema.profiles.avatarUrl,
        senderRole: schema.profiles.systemRole,
      })
      .from(schema.chatMessages)
      .leftJoin(schema.profiles, eq(schema.chatMessages.senderId, schema.profiles.id))
      .where(numericVillageId ? eq(schema.chatMessages.villageId, numericVillageId) : undefined)
      .orderBy(asc(schema.chatMessages.createdAt));

    const formatted = rows.map(({ message: m, senderName, senderMobile, senderPhoto, senderRole }) => ({
      id: String(m.id),
      villageId: m.villageId ? String(m.villageId) : '8',
      senderName: senderName || ANONYMOUS_SENDER,
      senderRole: senderRole === 'MEMBER' || !senderRole ? 'Member' : 'Admin',
      senderMobile: senderMobile || '',
      senderPhoto: senderPhoto || '',
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

    // Resolve the sender's profile from their mobile. This is now required
    // rather than cosmetic: the message records who sent it by id.
    let sender: { id: string; fullName: string; mobile: string | null; avatarUrl: string | null } | undefined;
    if (senderMobile) {
      const cleanMob = senderMobile.replace(/\D/g, '').slice(-10);
      const matched = await db.query.profiles.findFirst({
        where: (m, { sql }) => sql`RIGHT(REGEXP_REPLACE(${m.mobile}, '\\D', '', 'g'), 10) = ${cleanMob}`,
      });
      if (matched) {
        sender = matched;
        if (!resolvedVillageId && matched.villageId) resolvedVillageId = matched.villageId;
      }
    }

    const numericVillageId = resolvedVillageId || 8;

    const [inserted] = await db
      .insert(schema.chatMessages)
      .values({
        roomId: 'general',
        villageId: numericVillageId,
        senderId: sender?.id ?? null,
        text: text.trim(),
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : '8',
      senderName: sender?.fullName || senderName?.trim() || ANONYMOUS_SENDER,
      senderRole: senderRole,
      senderMobile: sender?.mobile || senderMobile.trim(),
      senderPhoto: sender?.avatarUrl || senderPhoto.trim() || '',
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
