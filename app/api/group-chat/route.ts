import { NextResponse } from 'next/server';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc } from 'drizzle-orm';
import { z } from 'zod';
import { validateRequestBody } from '@/src/lib/validations';

const groupMessageSchema = z.object({
  text: z.string().min(1, 'Message text is required').max(1000),
  senderName: z.string().min(1, 'Sender name is required'),
  senderRole: z.string().optional().default('Member'),
  senderMobile: z.string().optional(),
  senderPhoto: z.string().optional(),
  villageId: z.union([z.string(), z.number()]).optional(),
});

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, groupMessages: [] });

    const rows = await db.select().from(schema.groupMessages).orderBy(asc(schema.groupMessages.id));

    const formatted = rows.map((m) => ({
      id: String(m.id),
      villageId: m.villageId ? String(m.villageId) : '1',
      senderName: m.senderName,
      senderRole: m.senderRole || 'Member',
      senderMobile: m.senderMobile || '',
      senderPhoto: m.senderPhoto || '',
      text: m.text,
      timestamp: m.timestamp,
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

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : 1;

    const nowStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const [inserted] = await db
      .insert(schema.groupMessages)
      .values({
        villageId: numericVillageId,
        senderName: senderName.trim(),
        senderRole: senderRole.trim(),
        senderMobile: senderMobile.trim(),
        senderPhoto: senderPhoto.trim() || null,
        text: text.trim(),
        timestamp: nowStr,
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : '1',
      senderName: inserted.senderName,
      senderRole: inserted.senderRole,
      senderMobile: inserted.senderMobile,
      senderPhoto: inserted.senderPhoto,
      text: inserted.text,
      timestamp: inserted.timestamp,
      createdAt: inserted.createdAt,
    };

    return NextResponse.json({ success: true, message: formatted });
  } catch (err: any) {
    console.error('Error posting group message:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to send message' }, { status: 500 });
  }
}
