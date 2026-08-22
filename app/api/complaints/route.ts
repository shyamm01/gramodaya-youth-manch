import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { validateRequestBody, complaintCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { getRequestLimit } from "@/src/lib/requestParams";

/**
 * GET /api/complaints
 *
 * Supports:
 *   ?cursor=<id>      — cursor-based pagination (complaints with id < cursor)
 *   ?limit=<n>        — page size (default 50, max 100)
 *   ?villageId=<id>   — scope to a village
 *   ?status=<s>       — filter by status
 *   ?category=<c>     — filter by category enum value
 *   ?includeCounts=1  — return per-category and per-status counts
 */
export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, complaints: [], counts: null });

    const url = new URL(req.url);
    const limitParam = getRequestLimit(req);
    const limit = Math.min(limitParam || 50, 100);
    const cursor = Number(url.searchParams.get("cursor")) || undefined;
    const villageId = Number(url.searchParams.get("villageId")) || undefined;
    const statusFilter = url.searchParams.get("status") || undefined;
    const categoryFilter = url.searchParams.get("category") || undefined;
    const includeCounts = url.searchParams.get("includeCounts") === "1";

    // Build where conditions
    const conditions = [];
    if (villageId) conditions.push(eq(schema.complaints.villageId, villageId));
    if (statusFilter) conditions.push(eq(schema.complaints.status, statusFilter as any));
    if (categoryFilter) conditions.push(eq(schema.complaints.category, categoryFilter as any));
    if (cursor) conditions.push(sql`${schema.complaints.id} < ${cursor}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch complaints with villages info and attachments
    const rows = await db
      .select({
        complaint: schema.complaints,
        villageName: schema.villages.name,
        villageNameHindi: schema.villages.nameHindi,
        villageSlug: schema.villages.slug,
      })
      .from(schema.complaints)
      .leftJoin(schema.villages, eq(schema.complaints.villageId, schema.villages.id))
      .where(whereClause)
      .orderBy(desc(schema.complaints.id))
      .limit(limit);

    // Fetch attachments for these complaints in a single batch query
    const complaintIds = rows.map((r) => r.complaint.id);
    let attachmentsMap: Record<number, any[]> = {};
    if (complaintIds.length > 0) {
      const attachments = await db
        .select()
        .from(schema.complaintAttachments)
        .where(sql`${schema.complaintAttachments.complaintId} IN (${sql.join(complaintIds.map(id => sql`${id}`), sql`, `)})`);

      for (const att of attachments) {
        if (!attachmentsMap[att.complaintId]) attachmentsMap[att.complaintId] = [];
        attachmentsMap[att.complaintId].push({
          id: String(att.id),
          type: att.type,
          url: att.url,
          caption: att.caption,
        });
      }
    }

    const formatted = rows.map(({ complaint: c, villageName, villageNameHindi, villageSlug }) => ({
      id: String(c.id),
      villageId: c.villageId ? String(c.villageId) : null,
      villageName: villageName || null,
      villageNameHindi: villageNameHindi || null,
      villageSlug: villageSlug || null,
      village: c.villageId ? {
        id: String(c.villageId),
        name: villageName || 'Village',
        nameHindi: villageNameHindi || 'ग्राम',
        slug: villageSlug || '',
      } : null,
      memberId: c.userId ? String(c.userId) : undefined,
      categoryId: c.categoryId ? String(c.categoryId) : undefined,
      title: c.title,
      titleHindi: c.titleHindi || null,
      category: c.category,
      description: c.description,
      descriptionHindi: c.descriptionHindi || null,
      location: c.location,
      locationHindi: c.locationHindi || null,
      ward: c.ward || undefined,
      wardHindi: c.wardHindi || undefined,
      reporterName: c.reporterName,
      reporterMobile: c.reporterMobile,
      status: c.status,
      priority: c.priority || "medium",
      // Backward compat: still expose photoUrl/videoUrl
      photoUrl: c.photoUrl || "",
      videoUrl: c.videoUrl || "",
      attachments: attachmentsMap[c.id] || [],
      isActive: c.isActive !== undefined ? Boolean(c.isActive) : true,
      resolvedAt: c.resolvedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    // Optional: aggregate counts for filter badges
    let counts = null;
    if (includeCounts) {
      const villageCondition = villageId
        ? eq(schema.complaints.villageId, villageId)
        : undefined;

      const [statusCounts, categoryCounts] = await Promise.all([
        db
          .select({
            status: schema.complaints.status,
            count: count(),
          })
          .from(schema.complaints)
          .where(villageCondition)
          .groupBy(schema.complaints.status),
        db
          .select({
            category: schema.complaints.category,
            count: count(),
          })
          .from(schema.complaints)
          .where(villageCondition)
          .groupBy(schema.complaints.category),
      ]);

      counts = {
        byStatus: Object.fromEntries(statusCounts.map((r) => [r.status, Number(r.count)])),
        byCategory: Object.fromEntries(categoryCounts.map((r) => [r.category, Number(r.count)])),
        total: statusCounts.reduce((sum, r) => sum + Number(r.count), 0),
      };
    }

    // Next cursor for pagination
    const nextCursor = rows.length === limit ? rows[rows.length - 1].complaint.id : null;

    return NextResponse.json({
      success: true,
      complaints: formatted,
      nextCursor: nextCursor ? String(nextCursor) : null,
      counts,
    });
  } catch (err: any) {
    console.error("Error fetching complaints:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, complaintCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      title,
      titleHindi,
      category,
      categoryId,
      description,
      descriptionHindi,
      location = "Rasoolpur",
      locationHindi,
      ward,
      wardHindi,
      reporterName,
      reporterMobile,
      priority = "medium",
      photoUrl,
      videoUrl,
      attachments: incomingAttachments,
      villageId,
      isActive = true,
      adminName,
      adminMobile,
    } = validation.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    let resolvedVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : undefined;
    let resolvedUserId: string | undefined = undefined;
    let resolvedCategoryId: number | undefined = categoryId ? Number(categoryId) : undefined;

    // Resolve user from mobile (using indexed column, not regex)
    if (reporterMobile) {
      const cleanMob = reporterMobile.replace(/\D/g, "").slice(-10);
      const matchedMember = await db.query.profiles.findFirst({
        where: (m, { like }) => like(m.mobile, `%${cleanMob}`),
      });
      if (matchedMember) {
        resolvedUserId = matchedMember.id;
        if (!resolvedVillageId && matchedMember.villageId) {
          resolvedVillageId = matchedMember.villageId;
        }
      }
    }

    // Resolve categoryId from category name if not provided
    if (!resolvedCategoryId && category) {
      const catRow = await db.query.complaintCategories.findFirst({
        where: (c, { eq: eqOp }) => eqOp(c.name, category),
      });
      if (catRow) resolvedCategoryId = catRow.id;
    }

    const { ensureSupabaseUrl } = await import("@/src/lib/supabaseStorage");
    const cdnPhotoUrl = photoUrl ? await ensureSupabaseUrl(photoUrl, "grievances", "complaint") : null;

    const [inserted] = await db
      .insert(schema.complaints)
      .values({
        villageId: resolvedVillageId || null,
        userId: resolvedUserId || null,
        categoryId: resolvedCategoryId || null,
        title: title.trim(),
        titleHindi: titleHindi?.trim() || null,
        category: (category as any) || "Other",
        description: description.trim(),
        descriptionHindi: descriptionHindi?.trim() || null,
        location: location.trim(),
        locationHindi: locationHindi?.trim() || null,
        ward: ward?.trim() || null,
        wardHindi: wardHindi?.trim() || null,
        reporterName: reporterName.trim(),
        reporterMobile: reporterMobile.trim(),
        priority: (priority as any) || "medium",
        photoUrl: cdnPhotoUrl || photoUrl || null,
        videoUrl: videoUrl || null,
        status: "NEW",
        isActive: Boolean(isActive ?? true),
      })
      .returning();

    // Insert attachments (from explicit array + backward-compat photo/video)
    const attachmentRows: { complaintId: number; type: any; url: string; caption?: string }[] = [];

    if (cdnPhotoUrl || photoUrl) {
      attachmentRows.push({
        complaintId: inserted.id,
        type: "photo",
        url: cdnPhotoUrl || photoUrl!,
      });
    }
    if (videoUrl) {
      attachmentRows.push({
        complaintId: inserted.id,
        type: "video",
        url: videoUrl,
      });
    }
    if (incomingAttachments?.length) {
      for (const att of incomingAttachments) {
        attachmentRows.push({
          complaintId: inserted.id,
          type: att.type || "photo",
          url: att.url,
          caption: att.caption,
        });
      }
    }

    let insertedAttachments: any[] = [];
    if (attachmentRows.length > 0) {
      insertedAttachments = await db
        .insert(schema.complaintAttachments)
        .values(attachmentRows)
        .returning();
    }

    // Insert initial status history entry
    await db.insert(schema.complaintStatusHistory).values({
      complaintId: inserted.id,
      fromStatus: null,
      toStatus: "NEW",
      changedBy: resolvedUserId || null,
    });

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : null,
      memberId: inserted.userId ? String(inserted.userId) : undefined,
      categoryId: inserted.categoryId ? String(inserted.categoryId) : undefined,
      title: inserted.title,
      titleHindi: inserted.titleHindi || null,
      category: inserted.category,
      description: inserted.description,
      descriptionHindi: inserted.descriptionHindi || null,
      location: inserted.location,
      locationHindi: inserted.locationHindi || null,
      ward: inserted.ward || undefined,
      wardHindi: inserted.wardHindi || undefined,
      reporterName: inserted.reporterName,
      reporterMobile: inserted.reporterMobile,
      status: inserted.status,
      priority: inserted.priority,
      photoUrl: inserted.photoUrl || "",
      videoUrl: inserted.videoUrl || "",
      attachments: insertedAttachments.map((a) => ({
        id: String(a.id),
        type: a.type,
        url: a.url,
        caption: a.caption,
      })),
      isActive: inserted.isActive,
      createdAt: inserted.createdAt,
    };

    await logAuditAction(
      `शिकायत दर्ज की गई: ${inserted.title}`,
      adminName || reporterName,
      `Mobile: ${adminMobile || reporterMobile}`
    );

    return NextResponse.json({ success: true, complaint: formatted });
  } catch (err: any) {
    console.error("Error creating complaint:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create complaint" }, { status: 500 });
  }
}
