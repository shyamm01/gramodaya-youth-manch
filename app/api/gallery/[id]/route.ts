import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'gallery:moderate');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const { status, caption, adminName, adminMobile } = await req.json();

    const db = getDb();
    const numId = Number(id);

    if (db && !isNaN(numId)) {
      await db
        .update(schema.gallery)
        .set({
          ...(status !== undefined ? { status } : {}),
          ...(caption !== undefined ? { caption: caption.trim() } : {}),
        })
        .where(eq(schema.gallery.id, numId));
    }

    const store = loadStore();
    const item = store.gallery.find((g) => g.id === id);

    if (item) {
      if (status !== undefined) item.status = status;
      if (caption !== undefined) item.caption = caption.trim();
      saveStore(store);

      logAuditAction(
        `Updated Gallery Item (${item.caption || id})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        item.caption || id
      );
    }

    return NextResponse.json({ success: true, item: item || { id, status, caption } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating item' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'gallery:moderate');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);
    let photoToDelete: string | null = null;

    if (db && !isNaN(numId)) {
      const [existing] = await db
        .select({ photoUrl: schema.gallery.photoUrl })
        .from(schema.gallery)
        .where(eq(schema.gallery.id, numId));

      if (existing?.photoUrl) {
        photoToDelete = existing.photoUrl;
      }

      await db.delete(schema.gallery).where(eq(schema.gallery.id, numId));
    }

    const store = loadStore();
    const item = store.gallery.find((g) => g.id === id);
    if (item?.photoUrl && !photoToDelete) {
      photoToDelete = item.photoUrl;
    }

    store.gallery = store.gallery.filter((g) => g.id !== id);
    saveStore(store);

    if (photoToDelete) {
      deleteSupabaseObjectByUrl(photoToDelete).catch(() => {});
    }

    if (item) {
      logAuditAction(
        `Deleted Gallery Photo (${item.caption || id})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        item.caption || id
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting item' }, { status: 500 });
  }
}
