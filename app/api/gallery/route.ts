import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, galleryCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, gallery: [] });

    const rows = await db.select().from(schema.gallery).orderBy(desc(schema.gallery.id));

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

    const [inserted] = await db
      .insert(schema.gallery)
      .values({
        villageId: numericVillageId,
        photoUrl: photoUrl.trim(),
        caption: caption.trim(),
        uploadedBy: uploadedBy.trim(),
        uploadedByMobile: uploadedByMobile.trim(),
        status: "published",
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      caption: inserted.caption || "",
      photoUrl: inserted.photoUrl,
      uploadedBy: inserted.uploadedBy,
      uploadedByMobile: inserted.uploadedByMobile || "",
      date: inserted.date,
      status: inserted.status,
      createdAt: inserted.createdAt,
    };

    logAuditAction("Uploaded Gallery Photo: " + formatted.caption, adminName || uploadedBy, adminMobile || uploadedByMobile, formatted.caption);

    return NextResponse.json({ success: true, photo: formatted, item: formatted });
  } catch (err: any) {
    console.error("Error uploading photo to gallery:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to upload photo" }, { status: 500 });
  }
}
