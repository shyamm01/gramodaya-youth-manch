import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, socialWorkCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { requireAuth } from "@/src/lib/jwtAuth";
import { ensureSupabaseUrl } from "@/src/lib/supabaseStorage";
import { getRequestLimit } from "@/src/lib/requestParams";

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, socialWorks: [] });

    const limit = getRequestLimit(req);

    const baseQuery = db.select().from(schema.socialWorks).orderBy(desc(schema.socialWorks.id));
    const rows = limit ? await baseQuery.limit(limit) : await baseQuery;

    const formatted = rows.map((s) => ({
      id: String(s.id),
      villageId: s.villageId ? String(s.villageId) : "1",
      memberId: s.userId ? String(s.userId) : undefined,
      title: s.title,
      description: s.description,
      date: s.date,
      location: s.location,
      submitterName: s.submitterName,
      submitterMobile: s.submitterMobile,
      photoUrl: s.photoUrl || "",
      videoUrl: s.videoUrl || "",
      status: s.status,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, socialWorks: formatted });
  } catch (err: any) {
    console.error("Error fetching social work:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch social works" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce RBAC Permission for Submitting Social Work
    const auth = await requireAuth(req, 'social_works:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, socialWorkCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      title,
      description,
      location = "Rasoolpur",
      submitterName,
      submitterMobile,
      date,
      photoUrl,
      videoUrl,
      villageId,
      adminName,
      adminMobile,
    } = validation.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : 1;
    const cdnPhotoUrl = await ensureSupabaseUrl(photoUrl, "social-work", "social");

    const [inserted] = await db
      .insert(schema.socialWorks)
      .values({
        villageId: numericVillageId,
        title: title.trim(),
        description: description.trim(),
        date: date || new Date().toISOString().split("T")[0],
        location: location ? location.trim() : "Rasoolpur",
        submitterName: submitterName ? submitterName.trim() : (currentUser.name || "ग्राम सदस्य"),
        submitterMobile: submitterMobile ? submitterMobile.trim() : (currentUser.mobile || ""),
        photoUrl: cdnPhotoUrl || null,
        videoUrl: videoUrl ? videoUrl.trim() : null,
        status: "approved",
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      title: inserted.title,
      description: inserted.description,
      date: inserted.date,
      location: inserted.location,
      submitterName: inserted.submitterName,
      submitterMobile: inserted.submitterMobile,
      photoUrl: inserted.photoUrl || "",
      videoUrl: inserted.videoUrl || "",
      status: inserted.status,
      createdAt: inserted.createdAt,
    };

    logAuditAction(
      "Created Social Work: " + formatted.title,
      adminName || currentUser.name || "Admin",
      adminMobile || currentUser.mobile || "",
      formatted.title
    );

    return NextResponse.json({ success: true, socialWork: formatted });
  } catch (err: any) {
    console.error("Error creating social work:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create social work" }, { status: 500 });
  }
}
