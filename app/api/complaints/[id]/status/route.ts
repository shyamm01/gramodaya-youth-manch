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
    const auth = await requireAuth(req, 'complaints:update');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const { status, adminName, adminMobile } = await req.json();

    const db = getDb();
    const numId = Number(id);

    const isResolved = status === 'RESOLVED' || status === 'resolved';
    const resolvedAtDate = isResolved ? new Date() : null;

    if (db && !isNaN(numId)) {
      await db
        .update(schema.complaints)
        .set({
          status,
          ...(resolvedAtDate ? { resolvedAt: resolvedAtDate } : {}),
        })
        .where(eq(schema.complaints.id, numId));
    }

    // The database is the source of truth. The JSON store is a leftover from
    // before the Postgres migration and holds nothing for rows created since —
    // updating it stays best-effort, but a row missing from it must not turn a
    // successful database write into a 404, which is what used to happen.
    const store = loadStore();
    const complaint = store.complaints.find((c) => c.id === id);
    if (complaint) {
      complaint.status = status;
      if (resolvedAtDate) {
        complaint.resolvedAt = resolvedAtDate.toISOString();
      }
      saveStore(store);
    }

    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'शिकायत नहीं मिली।' }, { status: 404 });
    }

    logAuditAction(
      `Updated Complaint Status to "${status}"`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      complaint?.title || String(id)
    );

    return NextResponse.json({ success: true, complaint: complaint || { id, status } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
}
