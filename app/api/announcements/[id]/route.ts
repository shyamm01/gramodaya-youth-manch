import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'announcements:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json();
    const { title, content, isUrgent, adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);

    if (db && !isNaN(numId)) {
      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (isUrgent !== undefined) updateData.isUrgent = Boolean(isUrgent);

      await db.update(schema.announcements).set(updateData).where(eq(schema.announcements.id, numId));
    }

    const store = loadStore();
    const ann = store.announcements.find((a) => a.id === id);

    if (ann) {
      if (title !== undefined) ann.title = title.trim();
      if (content !== undefined) ann.content = content.trim();
      if (isUrgent !== undefined) (ann as any).isUrgent = Boolean(isUrgent);

      saveStore(store);

      logAuditAction(
        `Updated Announcement (${ann.title})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        ann.title
      );
    }

    return NextResponse.json({ success: true, announcement: ann || { id, title, content } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating announcement' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(req, props);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'announcements:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);

    if (db && !isNaN(numId)) {
      await db.delete(schema.announcements).where(eq(schema.announcements.id, numId));
    }

    const store = loadStore();
    const ann = store.announcements.find((a) => a.id === id);
    store.announcements = store.announcements.filter((a) => a.id !== id);
    saveStore(store);

    if (ann) {
      logAuditAction(
        `Deleted Announcement (${ann.title})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        ann.title
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting announcement' }, { status: 500 });
  }
}
