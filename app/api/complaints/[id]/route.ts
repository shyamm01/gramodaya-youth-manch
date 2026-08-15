import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'complaints:update');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json();

    const db = getDb();
    const numId = Number(id);

    if (db && !isNaN(numId)) {
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title.trim();
      if (body.category !== undefined) updateData.category = body.category;
      if (body.description !== undefined) updateData.description = body.description.trim();
      if (body.location !== undefined) updateData.location = body.location;
      if (body.status !== undefined) {
        updateData.status = body.status;
        if (body.status === 'RESOLVED' || body.status === 'resolved') {
          updateData.resolvedAt = new Date().toISOString();
        }
      }
      if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl;
      if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;

      await db.update(schema.complaints).set(updateData).where(eq(schema.complaints.id, numId));
    }

    const store = loadStore();
    const index = store.complaints.findIndex((c) => c.id === id);

    let updated: any;
    if (index !== -1) {
      updated = {
        ...store.complaints[index],
        ...body,
        id,
      };
      store.complaints[index] = updated;
      saveStore(store);
    }

    logAuditAction(
      `Updated Complaint (${body.title || id})`,
      body.updaterName || body.adminName || currentUser.name || 'Admin',
      body.updaterMobile || body.adminMobile || currentUser.mobile || '',
      body.title || id
    );

    return NextResponse.json({ success: true, complaint: updated || { id, ...body } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating complaint' }, { status: 500 });
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
    const auth = await requireAuth(req, 'complaints:delete');
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
        .select({ photoUrl: schema.complaints.photoUrl })
        .from(schema.complaints)
        .where(eq(schema.complaints.id, numId));

      if (existing?.photoUrl) {
        photoToDelete = existing.photoUrl;
      }

      await db.delete(schema.complaints).where(eq(schema.complaints.id, numId));
    }

    const store = loadStore();
    const item = store.complaints.find((c) => c.id === id);
    if (item?.photoUrl && !photoToDelete) {
      photoToDelete = item.photoUrl;
    }

    store.complaints = store.complaints.filter((c) => c.id !== id);
    saveStore(store);

    if (photoToDelete) {
      deleteSupabaseObjectByUrl(photoToDelete).catch(() => {});
    }

    if (item) {
      logAuditAction(
        `Deleted Complaint (${item.title})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        item.title
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting complaint' }, { status: 500 });
  }
}
