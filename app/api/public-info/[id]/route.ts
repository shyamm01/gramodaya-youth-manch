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
    const auth = await requireAuth(req, 'public_info:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json();

    // Rewritten onto the database: this handler only ever touched the JSON
    // store, which holds nothing for rows created since the Postgres migration,
    // so the edit was a no-op that answered 404. The store is still updated
    // where it happens to carry the row, but it no longer decides the outcome.
    const db = getDb();
    const numId = Number(id);
    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Public info item not found' }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    for (const field of [
      'title',
      'description',
      'category',
      'submitterName',
      'submitterMobile',
      'status',
    ]) {
      if (body[field] !== undefined) patch[field] = body[field];
    }

    const [row] = await db
      .update(schema.publicInfos)
      .set(patch)
      .where(eq(schema.publicInfos.id, numId))
      .returning();

    if (!row) {
      return NextResponse.json({ error: 'Public info item not found' }, { status: 404 });
    }
    const updated = { ...row, id: String(row.id) };

    const store = loadStore();
    const index = store.publicInfos.findIndex((i) => i.id === id);
    if (index !== -1) {
      store.publicInfos[index] = { ...store.publicInfos[index], ...body, id };
      saveStore(store);
    }

    logAuditAction(
      `Updated Public Info (${updated.title})`,
      body.updaterName || currentUser.name || 'Admin',
      body.updaterMobile || currentUser.mobile || '',
      updated.title || 'Public Info'
    );

    return NextResponse.json({ success: true, publicInfo: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating public info' }, { status: 500 });
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
    const auth = await requireAuth(req, 'public_info:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);
    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Public info item not found' }, { status: 404 });
    }

    const [removed] = await db
      .delete(schema.publicInfos)
      .where(eq(schema.publicInfos.id, numId))
      .returning();

    if (!removed) {
      return NextResponse.json({ error: 'Public info item not found' }, { status: 404 });
    }

    const store = loadStore();
    if (store.publicInfos.some((i) => i.id === id)) {
      store.publicInfos = store.publicInfos.filter((i) => i.id !== id);
      saveStore(store);
    }

    logAuditAction(
      `Deleted Public Info (${removed.title})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      removed.title || 'Public Info'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting item' }, { status: 500 });
  }
}
