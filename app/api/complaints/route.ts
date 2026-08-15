import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, complaintCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, complaints: [] });

    const rows = await db.select().from(schema.complaints).orderBy(desc(schema.complaints.id));

    const formatted = rows.map((c) => ({
      id: String(c.id),
      villageId: c.villageId ? String(c.villageId) : "1",
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

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : 1;

    const [inserted] = await db
      .insert(schema.complaints)
      .values({
        villageId: numericVillageId,
        title: title.trim(),
        category: (category as any) || "Other",
        description: description.trim(),
        location: location.trim(),
        reporterName: reporterName.trim(),
        reporterMobile: reporterMobile.trim(),
        photoUrl: photoUrl || null,
        videoUrl: videoUrl || null,
        status: "NEW",
        isDemo: Boolean(isDemo),
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      title: inserted.title,
      category: inserted.category,
      description: inserted.description,
      location: inserted.location,
      reporterName: inserted.reporterName,
      reporterMobile: inserted.reporterMobile,
      status: inserted.status,
      photoUrl: inserted.photoUrl || "",
      videoUrl: inserted.videoUrl || "",
      isDemo: inserted.isDemo || false,
      createdAt: inserted.createdAt,
    };

    logAuditAction("Registered Grievance: " + formatted.title, reporterName, reporterMobile, formatted.title);

    return NextResponse.json({ success: true, complaint: formatted });
  } catch (err: any) {
    console.error("Error submitting complaint:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to submit grievance" }, { status: 500 });
  }
}
