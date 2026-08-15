import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, title, name, description, date, time, location, photoUrl, videoUrl, adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);

    if (db && !isNaN(numId)) {
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (title !== undefined || name !== undefined) updateData.title = (title || name).trim();
      if (description !== undefined) updateData.description = description.trim();
      if (date !== undefined) updateData.date = date;
      if (time !== undefined) updateData.time = time;
      if (location !== undefined) updateData.location = location;
      if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
      if (videoUrl !== undefined) updateData.videoUrl = videoUrl;

      await db.update(schema.events).set(updateData).where(eq(schema.events.id, numId));
    }

    const store = loadStore();
    const event = store.events.find((e) => e.id === id);

    if (event) {
      if (status !== undefined) event.status = status;
      if (title !== undefined || name !== undefined) {
        const t = title || name;
        event.title = t;
        event.name = t;
      }
      if (description !== undefined) event.description = description;
      if (date !== undefined) event.date = date;
      if (time !== undefined) event.time = time;
      if (location !== undefined) event.location = location;
      if (photoUrl !== undefined) event.photoUrl = photoUrl;
      if (videoUrl !== undefined) event.videoUrl = videoUrl;

      saveStore(store);

      logAuditAction(
        `Updated Event (${event.title})`,
        adminName || 'Admin',
        adminMobile || '',
        event.title
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating event' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);
    let photoToDelete: string | null = null;

    if (db && !isNaN(numId)) {
      const [existing] = await db
        .select({ photoUrl: schema.events.photoUrl })
        .from(schema.events)
        .where(eq(schema.events.id, numId));

      if (existing?.photoUrl) {
        photoToDelete = existing.photoUrl;
      }

      await db.delete(schema.events).where(eq(schema.events.id, numId));
    }

    const store = loadStore();
    const event = store.events.find((e) => e.id === id);
    if (event?.photoUrl && !photoToDelete) {
      photoToDelete = event.photoUrl;
    }

    store.events = store.events.filter((e) => e.id !== id);
    saveStore(store);

    // Auto-clean storage banner from Supabase bucket
    if (photoToDelete) {
      deleteSupabaseObjectByUrl(photoToDelete).catch((err) =>
        console.warn('Storage delete error on event delete:', err)
      );
    }

    if (event) {
      logAuditAction(
        `Deleted Event (${event.title})`,
        adminName || 'Admin',
        adminMobile || '',
        event.title
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting event' }, { status: 500 });
  }
}
