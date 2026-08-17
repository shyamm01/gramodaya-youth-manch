import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, galleryCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { requireAuth } from "@/src/lib/jwtAuth";
import { ensureSupabaseUrl } from "@/src/lib/supabaseStorage";

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, gallery: [] });

    const limitParam = Number(new URL(req.url).searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

    const baseQuery = db.select().from(schema.gallery).orderBy(desc(schema.gallery.id));
    const rows = limit ? await baseQuery.limit(limit) : await baseQuery;

    const formatted = rows.map((g) => ({
      id: String(g.id),
      villageId: g.villageId ? String(g.villageId) : "1",
      caption: g.caption || "",
      photoUrl: g.photoUrl,
      uploadedBy: g.uploadedBy,
      uploadedByMobile: g.uploadedByMobile || "",
      date: g.date,
      status: g.status,
      createdAt: g.createdAt,
    }));

    return NextResponse.json({ success: true, gallery: formatted });
  } catch (err: any) {
    console.error("Error fetching gallery:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce RBAC Permission for Gallery Upload
    const auth = await requireAuth(req, 'gallery:upload');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, galleryCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      photoUrl,
      caption = "",
      uploadedBy = "Admin",
      uploadedByMobile = "",
      villageId,
      adminName,
      adminMobile,
    } = validation.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : 1;
    const cdnPhotoUrl = await ensureSupabaseUrl(photoUrl, "gallery", "gallery");

    const [inserted] = await db
      .insert(schema.gallery)
      .values({
        villageId: numericVillageId,
        caption: caption.trim(),
        photoUrl: cdnPhotoUrl,
        uploadedBy: uploadedBy || currentUser.name || "Admin",
        uploadedByMobile: uploadedByMobile || currentUser.mobile || "",
        date: new Date().toISOString().split("T")[0],
        status: "published",
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      caption: inserted.caption,
      photoUrl: inserted.photoUrl,
      uploadedBy: inserted.uploadedBy,
      uploadedByMobile: inserted.uploadedByMobile,
      date: inserted.date,
      status: inserted.status,
      createdAt: inserted.createdAt,
    };

    logAuditAction(
      "Uploaded Gallery Photo: " + (formatted.caption || formatted.id),
      adminName || currentUser.name || "Admin",
      adminMobile || currentUser.mobile || "",
      formatted.caption || formatted.id
    );

    return NextResponse.json({ success: true, item: formatted });
  } catch (err: any) {
    console.error("Error creating gallery item:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to upload gallery photo" }, { status: 500 });
  }
}
