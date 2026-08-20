import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, complaintCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { getRequestLimit } from "@/src/lib/requestParams";

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, complaints: [] });

    const limit = getRequestLimit(req);

    const baseQuery = db.select().from(schema.complaints).orderBy(desc(schema.complaints.id));
    const rows = limit ? await baseQuery.limit(limit) : await baseQuery;

    const formatted = rows.map((c) => ({
      id: String(c.id),
      villageId: c.villageId ? String(c.villageId) : "8",
      memberId: c.userId ? String(c.userId) : undefined,
      title: c.title,
      category: c.category,
      description: c.description,
      location: c.location,
      reporterName: c.reporterName,
      reporterMobile: c.reporterMobile,
      status: c.status,
      photoUrl: c.photoUrl || "",
      videoUrl: c.videoUrl || "",
      isDemo: c.isDemo || false,
      resolvedAt: c.resolvedAt,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ success: true, complaints: formatted });
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
      category,
      description,
      location = "Rasoolpur",
      reporterName,
      reporterMobile,
      photoUrl,
      videoUrl,
      villageId,
      isDemo = false,
      adminName,
      adminMobile,
    } = validation.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    let resolvedVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : undefined;
    let resolvedUserId: string | undefined = undefined;

    // Automatically resolve village_id and user_id from logged-in / reporting user
    if (reporterMobile) {
      const cleanMob = reporterMobile.replace(/\D/g, "").slice(-10);
      const matchedMember = await db.query.profiles.findFirst({
        where: (m, { sql }) => sql`RIGHT(REGEXP_REPLACE(${m.mobile}, '\\D', '', 'g'), 10) = ${cleanMob}`,
      });
      if (matchedMember) {
        resolvedUserId = matchedMember.id;
        if (!resolvedVillageId && matchedMember.villageId) {
          resolvedVillageId = matchedMember.villageId;
        }
      }
    }

    const numericVillageId = resolvedVillageId || 8;
    const { ensureSupabaseUrl } = await import("@/src/lib/supabaseStorage");
    const cdnPhotoUrl = photoUrl ? await ensureSupabaseUrl(photoUrl, "grievances", "complaint") : null;

    const [inserted] = await db
      .insert(schema.complaints)
      .values({
        villageId: numericVillageId,
        userId: resolvedUserId || null,
        title: title.trim(),
        category: (category as any) || "Other",
        description: description.trim(),
        location: location.trim(),
        reporterName: reporterName.trim(),
        reporterMobile: reporterMobile.trim(),
        photoUrl: cdnPhotoUrl || photoUrl || null,
        videoUrl: videoUrl || null,
        status: "NEW",
        isDemo: Boolean(isDemo),
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      memberId: (inserted as any).userId ? String((inserted as any).userId) : undefined,
      title: inserted.title,
      category: inserted.category,
      description: inserted.description,
      location: inserted.location,
      reporterName: inserted.reporterName,
      reporterMobile: inserted.reporterMobile,
      status: inserted.status,
      photoUrl: inserted.photoUrl || "",
      videoUrl: inserted.videoUrl || "",
      isDemo: inserted.isDemo,
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
