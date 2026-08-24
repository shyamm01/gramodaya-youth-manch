import { NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/jwtAuth';
import { logAuditAction } from '@/src/lib/authUtils';
import { deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * GET /api/complaints/[id]
 * Fetch single complaint with attachments and status history
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const db = getDb();

    if (!db || isNaN(numId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID or database unavailable' }, { status: 400 });
    }

    const [row] = await db
      .select({
        complaint: schema.complaints,
        villageName: schema.villages.name,
        villageNameHindi: schema.villages.nameHindi,
        villageSlug: schema.villages.slug,
        categoryName: schema.complaintCategories.name,
        categoryNameHindi: schema.complaintCategories.nameHindi,
        categorySlug: schema.complaintCategories.slug,
      })
      .from(schema.complaints)
      .leftJoin(schema.villages, eq(schema.complaints.villageId, schema.villages.id))
      .leftJoin(
        schema.complaintCategories,
        eq(schema.complaints.categoryId, schema.complaintCategories.id)
      )
      .where(eq(schema.complaints.id, numId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    const [attachments, statusHistory] = await Promise.all([
      db
        .select()
        .from(schema.complaintAttachments)
        .where(eq(schema.complaintAttachments.complaintId, numId))
        .orderBy(schema.complaintAttachments.id),
      db
        .select()
        .from(schema.complaintStatusHistory)
        .where(eq(schema.complaintStatusHistory.complaintId, numId))
        .orderBy(schema.complaintStatusHistory.id),
    ]);

    const {
      complaint: c, villageName, villageNameHindi, villageSlug,
      categoryName, categoryNameHindi, categorySlug,
    } = row;

    const formatted: Record<string, any> = {
      id: String(c.id),
      villageId: c.villageId ? String(c.villageId) : undefined,
      villageName: villageName || undefined,
      villageNameHindi: villageNameHindi || undefined,
      villageSlug: villageSlug || undefined,
      memberId: c.userId ? String(c.userId) : undefined,
      categoryId: c.categoryId ? String(c.categoryId) : undefined,
      title: c.title,
      titleHindi: c.titleHindi || undefined,
      // Resolved from complaint_categories, not stored on the complaint.
      category: categoryName || 'Other',
      categoryHindi: categoryNameHindi || undefined,
      categorySlug: categorySlug || undefined,
      description: c.description,
      descriptionHindi: c.descriptionHindi || undefined,
      location: c.location,
      locationHindi: c.locationHindi || undefined,
      ward: c.ward || undefined,
      wardHindi: c.wardHindi || undefined,
      reporterName: c.reporterName,
      reporterMobile: c.reporterMobile,
      status: c.status,
      priority: c.priority || "medium",
      photoUrl: attachments.find((a) => a.type === 'photo')?.url || attachments[0]?.url || undefined,
      videoUrl: attachments.find((a) => a.type === 'video')?.url || undefined,
      resolvedAt: c.resolvedAt || undefined,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };

    if (attachments.length > 0) {
      formatted.attachments = attachments.map((a) => ({
        id: String(a.id),
        type: a.type,
        url: a.url,
        caption: a.caption,
      }));
    }

    if (statusHistory.length > 0) {
      formatted.statusHistory = statusHistory.map((s) => ({
        id: String(s.id),
        fromStatus: s.fromStatus,
        toStatus: s.toStatus,
        changedBy: s.changedBy,
        note: s.note,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
      }));
    }

    return NextResponse.json({ success: true, complaint: formatted });
  } catch (error: any) {
    console.error('Error fetching complaint details:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch complaint details' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req);
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json();

    const db = getDb();
    const numId = Number(id);

    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Database unavailable or invalid ID' }, { status: 400 });
    }

    // Fetch current state for ownership & status history
    const [existing] = await db
      .select({
        id: schema.complaints.id,
        status: schema.complaints.status,
        userId: schema.complaints.userId,
        reporterMobile: schema.complaints.reporterMobile,
        villageId: schema.complaints.villageId,
      })
      .from(schema.complaints)
      .where(eq(schema.complaints.id, numId));

    if (!existing) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Authorization check: Admin OR Author of the post
    const cleanUserMob = (currentUser.mobile || '').replace(/\D/g, '').slice(-10);
    const cleanPostMob = (existing.reporterMobile || '').replace(/\D/g, '').slice(-10);
    const isAuthor = (cleanUserMob && cleanUserMob === cleanPostMob) || (existing.userId && existing.userId === currentUser.id);
    const isAdmin = currentUser.isAdmin || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only edit grievances you submitted.' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.titleHindi !== undefined) updateData.titleHindi = body.titleHindi ? body.titleHindi.trim() : null;
    // A complaint's category is categoryId and nothing else. A body that still
    // sends the display name is resolved through the lookup table.
    if (body.categoryId !== undefined) {
      updateData.categoryId = Number(body.categoryId) || null;
    } else if (body.category !== undefined) {
      const catRow = await db.query.complaintCategories.findFirst({
        where: (c, { eq: eqOp }) => eqOp(c.name, body.category),
      });
      if (catRow) updateData.categoryId = catRow.id;
    }
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.descriptionHindi !== undefined) updateData.descriptionHindi = body.descriptionHindi ? body.descriptionHindi.trim() : null;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.locationHindi !== undefined) updateData.locationHindi = body.locationHindi || null;
    if (body.ward !== undefined) updateData.ward = body.ward || null;
    if (body.wardHindi !== undefined) updateData.wardHindi = body.wardHindi || null;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    
    // Status can only be changed by admin or if authorized
    if (body.status !== undefined && isAdmin) {
      updateData.status = body.status;
      if (body.status === 'RESOLVED' || body.status === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }
    }
    const [updated] = await db
      .update(schema.complaints)
      .set(updateData)
      .where(eq(schema.complaints.id, numId))
      .returning();

    // Record status transition in history if status changed by admin
    if (body.status !== undefined && body.status !== existing.status && isAdmin) {
      await db.insert(schema.complaintStatusHistory).values({
        complaintId: numId,
        fromStatus: existing.status,
        toStatus: body.status,
        changedBy: currentUser.id || null,
        note: body.statusNote || null,
      });
    }

    // Media edits go to complaint_attachments — the complaint row no longer
    // has photo_url / video_url of its own. A body that still sends those two
    // is folded into the attachment list here.
    const incomingMedia: { type: string; url: string; caption: string | null }[] = [];
    if (body.photoUrl) incomingMedia.push({ type: 'photo', url: body.photoUrl, caption: null });
    if (body.videoUrl) incomingMedia.push({ type: 'video', url: body.videoUrl, caption: null });
    for (const att of body.attachments || []) {
      incomingMedia.push({ type: att.type || 'photo', url: att.url, caption: att.caption || null });
    }

    if (incomingMedia.length) {
      const attachmentRows = incomingMedia
        .filter((row, i) => incomingMedia.findIndex((r) => r.url === row.url) === i)
        .map((att) => ({
          complaintId: numId,
          type: att.type as any,
          url: att.url,
          caption: att.caption,
        }));
      // (complaint_id, url) is unique — re-submitting the same image is a no-op.
      await db
        .insert(schema.complaintAttachments)
        .values(attachmentRows)
        .onConflictDoNothing();
    }

    logAuditAction(
      `Updated Complaint (${updated?.title || id})`,
      body.updaterName || body.adminName || currentUser.name || 'User',
      body.updaterMobile || body.adminMobile || currentUser.mobile || '',
      updated?.title || String(id)
    );

    return NextResponse.json({ success: true, complaint: updated ? { ...updated, id: String(updated.id) } : { id } });
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
    const auth = await requireAuth(req);
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const db = getDb();
    const numId = Number(id);

    if (!db || isNaN(numId)) {
      return NextResponse.json({ error: 'Database unavailable or invalid ID' }, { status: 400 });
    }

    // Fetch the complaint for ownership check & cleanup
    const [existing] = await db
      .select({
        id: schema.complaints.id,
        title: schema.complaints.title,
        userId: schema.complaints.userId,
        reporterMobile: schema.complaints.reporterMobile,
      })
      .from(schema.complaints)
      .where(eq(schema.complaints.id, numId));

    if (!existing) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Authorization check: Admin OR Author of the post
    const cleanUserMob = (currentUser.mobile || '').replace(/\D/g, '').slice(-10);
    const cleanPostMob = (existing.reporterMobile || '').replace(/\D/g, '').slice(-10);
    const isAuthor = (cleanUserMob && cleanUserMob === cleanPostMob) || (existing.userId && existing.userId === currentUser.id);
    const isAdmin = currentUser.isAdmin || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete grievances you submitted.' },
        { status: 403 }
      );
    }

    // Get all attachment URLs for storage cleanup
    const attachments = await db
      .select({ url: schema.complaintAttachments.url })
      .from(schema.complaintAttachments)
      .where(eq(schema.complaintAttachments.complaintId, numId));

    // Cascade delete handles complaint_attachments and complaint_status_history
    await db.delete(schema.complaints).where(eq(schema.complaints.id, numId));

    // Clean up storage objects. complaint_attachments is the only place a
    // grievance's media is recorded, so this list is complete.
    const urlsToDelete = attachments.map((a) => a.url);
    for (const url of urlsToDelete) {
      deleteSupabaseObjectByUrl(url).catch(() => {});
    }

    logAuditAction(
      `Deleted Complaint (${existing.title})`,
      adminName || currentUser.name || 'User',
      adminMobile || currentUser.mobile || '',
      existing.title
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting complaint' }, { status: 500 });
  }
}
