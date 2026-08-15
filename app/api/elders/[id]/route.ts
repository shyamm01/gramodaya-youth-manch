import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { deleteSupabaseObjectByUrl, ensureSupabaseUrl } from '@/src/lib/supabaseStorage';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'elders:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json();
    const { name, age, role, contribution, photoUrl, adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);

    let finalPhotoUrl = photoUrl;
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('data:')) {
      finalPhotoUrl = await ensureSupabaseUrl(photoUrl, 'elders', 'elder');
    }

    if (db && !isNaN(numId)) {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (age !== undefined) updateData.age = age ? String(age).trim() : null;
      if (role !== undefined) updateData.role = role ? role.trim() : null;
      if (contribution !== undefined) updateData.contribution = contribution ? contribution.trim() : null;
      if (finalPhotoUrl !== undefined) updateData.photoUrl = finalPhotoUrl;

      await db.update(schema.elders).set(updateData).where(eq(schema.elders.id, numId));
    }

    const store = loadStore();
    const elder = store.elders.find((e) => e.id === id);

    if (elder) {
      if (name !== undefined) elder.name = name.trim();
      if (photoUrl !== undefined) elder.photoUrl = finalPhotoUrl;
      saveStore(store);

      logAuditAction(
        `Updated Elder (${elder.name})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        elder.name
      );
    }

    return NextResponse.json({ success: true, elder: elder || { id, name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating elder' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'elders:manage');
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
        .select({ photoUrl: schema.elders.photoUrl })
        .from(schema.elders)
        .where(eq(schema.elders.id, numId));

      if (existing?.photoUrl) {
        photoToDelete = existing.photoUrl;
      }

      await db.delete(schema.elders).where(eq(schema.elders.id, numId));
    }

    const store = loadStore();
    const elder = store.elders.find((e) => e.id === id);
    if (elder?.photoUrl && !photoToDelete) {
      photoToDelete = elder.photoUrl;
    }

    store.elders = store.elders.filter((e) => e.id !== id);
    saveStore(store);

    if (photoToDelete) {
      deleteSupabaseObjectByUrl(photoToDelete).catch(() => {});
    }

    if (elder) {
      logAuditAction(
        `Deleted Elder (${elder.name})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        elder.name
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting elder' }, { status: 500 });
  }
}
