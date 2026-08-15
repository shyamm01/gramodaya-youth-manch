import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, socialWorkCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, socialWorks: [] });

    const rows = await db.select().from(schema.socialWorks).orderBy(desc(schema.socialWorks.id));

    const formatted = rows.map((s) => ({
      id: String(s.id),
      villageId: s.villageId ? String(s.villageId) : "1",
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
    console.error("Error fetching social works:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch social works" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    const [inserted] = await db
      .insert(schema.socialWorks)
      .values({
        villageId: numericVillageId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        submitterName: submitterName.trim(),
        submitterMobile: submitterMobile.trim(),
        date: date || new Date().toISOString().split("T")[0],
        photoUrl: photoUrl || null,
        videoUrl: videoUrl || null,
        status: "pending",
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

    logAuditAction("Submitted Social Work: " + formatted.title, submitterName, submitterMobile, formatted.title);

    return NextResponse.json({ success: true, socialWork: formatted });
  } catch (err: any) {
    console.error("Error creating social work:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create social work" }, { status: 500 });
  }
}
