import { NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

/** Valid status transitions map — prevents nonsensical jumps */
const VALID_TRANSITIONS: Record<string, string[]> = {
  'NEW': ['ACTION IN PROGRESS', 'RESOLVED'],
  'ACTION IN PROGRESS': ['NEW', 'RESOLVED'],
  'RESOLVED': ['NEW', 'ACTION IN PROGRESS'],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'complaints:update');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const { status, adminName, adminMobile, note } = await req.json();

    const db = getDb();
    const numId = Number(id);

    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Database unavailable or invalid ID' }, { status: 400 });
    }

    // Fetch current complaint status
    const [existing] = await db
      .select({
        status: schema.complaints.status,
        title: schema.complaints.title,
      })
      .from(schema.complaints)
      .where(eq(schema.complaints.id, numId));

    if (!existing) {
      return NextResponse.json({ error: 'शिकायत नहीं मिली।' }, { status: 404 });
    }

    // Validate status transition
    const validNextStatuses = VALID_TRANSITIONS[existing.status];
    if (validNextStatuses && !validNextStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from "${existing.status}" to "${status}"` },
        { status: 400 }
      );
    }

    const isResolved = status === 'RESOLVED' || status === 'resolved';
    const resolvedAtDate = isResolved ? new Date() : null;

    // Update complaint status
    const [updated] = await db
      .update(schema.complaints)
      .set({
        status,
        ...(resolvedAtDate ? { resolvedAt: resolvedAtDate } : {}),
      })
      .where(eq(schema.complaints.id, numId))
      .returning();

    // Record status transition in history
    await db.insert(schema.complaintStatusHistory).values({
      complaintId: numId,
      fromStatus: existing.status,
      toStatus: status,
      changedBy: currentUser.id || null,
      note: note || null,
    });

    logAuditAction(
      `Updated Complaint Status to "${status}"`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      existing.title || String(id)
    );

    return NextResponse.json({
      success: true,
      complaint: updated ? { ...updated, id: String(updated.id) } : { id, status },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
}
