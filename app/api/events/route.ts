import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, eventCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { requireAuth } from "@/src/lib/jwtAuth";
import { ensureSupabaseUrl } from "@/src/lib/supabaseStorage";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, events: [] });

    const rows = await db.select().from(schema.events).orderBy(desc(schema.events.id));

    const formatted = rows.map((e) => ({
      id: String(e.id),
      villageId: e.villageId ? String(e.villageId) : "1",
      title: e.title,
      name: e.title,
      description: e.description || "",
      date: e.date,
      time: e.time,
      location: e.location,
      photoUrl: e.photoUrl || "",
      videoUrl: e.videoUrl || "",
      status: e.status,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ success: true, events: formatted });
  } catch (err: any) {
    console.error("Error fetching events:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce RBAC Permission for Event Creation
    const auth = await requireAuth(req, 'events:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, eventCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      title,
      description = "",
      date,
      time,
      location,
      photoUrl,
      videoUrl,
      status = "upcoming",
      villageId,
      adminName,
      adminMobile,
    } = validation.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : 1;

    // Enforce Supabase public CDN URL for event banner
    const finalPhotoUrl = await ensureSupabaseUrl(photoUrl, 'events', 'event');

    const validStatus = (
      ['DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED'].includes(status?.toUpperCase())
        ? status.toUpperCase()
        : 'PUBLISHED'
    ) as 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

    const [inserted] = await db
      .insert(schema.events)
      .values({
        villageId: numericVillageId,
        title: title.trim(),
        description: description.trim(),
        date: date || new Date().toISOString().split("T")[0],
        time: time ? time.trim() : null,
        location: location ? location.trim() : null,
        photoUrl: finalPhotoUrl || null,
        videoUrl: videoUrl ? videoUrl.trim() : null,
        status: validStatus,
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      title: inserted.title,
      name: inserted.title,
      description: inserted.description || "",
      date: inserted.date,
      time: inserted.time,
      location: inserted.location,
      photoUrl: inserted.photoUrl || "",
      videoUrl: inserted.videoUrl || "",
      status: inserted.status,
      createdAt: inserted.createdAt,
    };

    logAuditAction(
      "Created Event: " + formatted.title,
      adminName || currentUser.name || "Admin",
      adminMobile || currentUser.mobile || "",
      formatted.title
    );

    return NextResponse.json({ success: true, event: formatted });
  } catch (err: any) {
    console.error("Error creating event:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create event" }, { status: 500 });
  }
}
