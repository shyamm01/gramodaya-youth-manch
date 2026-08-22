import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'public_info:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const { status, adminName, adminMobile } = await req.json();

    // Database first — the JSON store below is a pre-migration leftover and
    // must not decide whether the update happened.
    const db = getDb();
    const numId = Number(id);
    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'सूचना नहीं मिली।' }, { status: 404 });
    }

    const [row] = await db
      .update(schema.publicInfos)
      .set({ status })
      .where(eq(schema.publicInfos.id, numId))
      .returning();

    if (!row) {
      return NextResponse.json({ error: 'सूचना नहीं मिली।' }, { status: 404 });
    }

    const store = loadStore();
    const info = store.publicInfos.find((i) => i.id === id);
    if (info) {
      info.status = status;
      saveStore(store);
    }

    logAuditAction(
      `Updated Public Info Status to "${status}" (${row.title})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      row.title
    );

    return NextResponse.json({ success: true, publicInfo: { ...row, id: String(row.id) } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
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
    let deletedTitle: string | undefined;
    if (db && !isNaN(numId)) {
      const [removed] = await db
        .delete(schema.publicInfos)
        .where(eq(schema.publicInfos.id, numId))
        .returning();
      deletedTitle = removed?.title;
    }

    const store = loadStore();
    const item = store.publicInfos.find((i) => i.id === id);
    if (item) {
      store.publicInfos = store.publicInfos.filter((i) => i.id !== id);
      saveStore(store);
    }

    logAuditAction(
      `Deleted Public Info (${deletedTitle || id})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      deletedTitle || String(id)
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting info' }, { status: 500 });
  }
}
