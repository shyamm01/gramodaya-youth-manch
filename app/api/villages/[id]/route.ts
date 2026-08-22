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
    const auth = await requireAuth(req, 'village:manage', 'ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json();

    // Rewritten onto the database — this used to edit the JSON store only, so
    // a village created after the migration could not be edited at all.
    const db = getDb();
    const numId = Number(id);
    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    for (const field of [
      'name',
      'nameHindi',
      'slug',
      'blockName',
      'blockNameHindi',
      'pincode',
      'postOffice',
      'orgName',
      'orgNameHindi',
      'sloganHindi',
      'taglineHindi',
      'orgPurposeHindi',
      'contactMobile',
      'contactEmail',
      'bannerPhotoUrl',
      'isActive',
    ]) {
      if (body[field] !== undefined) patch[field] = body[field];
    }

    const [row] = await db
      .update(schema.villages)
      .set(patch)
      .where(eq(schema.villages.id, numId))
      .returning();

    if (!row) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 });
    }
    const updated = { ...row, id: String(row.id) };

    const store = loadStore();
    const index = (store.villages || []).findIndex((v) => v.id === id);
    if (index !== -1) {
      store.villages[index] = { ...store.villages[index], ...body, id };
      saveStore(store);
    }

    logAuditAction(
      `Updated Village Unit: ${updated.nameHindi || updated.name}`,
      body.adminName || currentUser.name || 'Admin',
      body.adminMobile || currentUser.mobile || '',
      updated.name
    );

    return NextResponse.json({ success: true, village: updated, villages: store.villages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating village' }, { status: 500 });
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
    const auth = await requireAuth(req, 'village:manage', 'SUPER_ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const db = getDb();
    const numId = Number(id);
    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 });
    }

    const [removed] = await db
      .delete(schema.villages)
      .where(eq(schema.villages.id, numId))
      .returning();

    if (!removed) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 });
    }

    const store = loadStore();
    if ((store.villages || []).some((v) => v.id === id)) {
      store.villages = (store.villages || []).filter((v) => v.id !== id);
      saveStore(store);
    }

    logAuditAction(
      `Deleted Village Unit: ${removed.nameHindi || removed.name}`,
      body.adminName || currentUser.name || 'Admin',
      body.adminMobile || currentUser.mobile || '',
      removed.name
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting village' }, { status: 500 });
  }
}
