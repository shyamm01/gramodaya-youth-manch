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
    const auth = await requireAuth(req, 'social_works:publish');
    if (!auth.success) return auth.response;

    const { id } = await params;
    const { status, adminName, adminMobile } = await req.json();

    // This handler only ever wrote to the JSON store, which holds nothing for
    // rows created since the Postgres migration — approving an initiative was
    // a no-op that answered 404. The database is now the write, and the store
    // is kept in step only when it happens to carry the row.
    const db = getDb();
    const numId = Number(id);
    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'रिकॉर्ड नहीं मिला।' }, { status: 404 });
    }

    const [updated] = await db
      .update(schema.socialWorks)
      .set({ status })
      .where(eq(schema.socialWorks.id, numId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'रिकॉर्ड नहीं मिला।' }, { status: 404 });
    }

    const store = loadStore();
    const item = store.socialWorks.find((w) => w.id === id);
    if (item) {
      item.status = status;
      saveStore(store);
    }

    logAuditAction(
      `Updated Social Work Status to "${status}" (${updated.title})`,
      adminName || auth.user.name || 'Admin',
      adminMobile || auth.user.mobile || '',
      updated.title
    );

    return NextResponse.json({
      success: true,
      socialWork: { ...updated, id: String(updated.id) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
}
