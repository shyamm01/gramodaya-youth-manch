import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, announcementCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { requireAuth } from "@/src/lib/jwtAuth";
import { getRequestLimit } from "@/src/lib/requestParams";

export async function GET(req: Request) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, announcements: [] });

    const limit = getRequestLimit(req);

    const baseQuery = db.select().from(schema.announcements).orderBy(desc(schema.announcements.id));
    const rows = limit ? await baseQuery.limit(limit) : await baseQuery;

    const formatted = rows.map((a) => ({
      id: String(a.id),
      villageId: a.villageId ? String(a.villageId) : "1",
      title: a.title,
      content: a.content,
      publishedBy: a.publishedBy,
      isUrgent: a.isUrgent || false,
      date: a.date,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ success: true, announcements: formatted });
  } catch (err: any) {
    console.error("Error fetching announcements:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce RBAC Permission for Publishing Announcements
    const auth = await requireAuth(req, 'announcements:publish');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, announcementCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      title,
      content,
      publishedBy = "ग्रामोदय यूथ मंच",
      isUrgent = false,
      date,
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
      .insert(schema.announcements)
      .values({
        villageId: numericVillageId,
        title: title.trim(),
        content: content.trim(),
        publishedBy: publishedBy.trim(),
        isUrgent: Boolean(isUrgent),
        date: date || new Date().toISOString().split("T")[0],
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      title: inserted.title,
      content: inserted.content,
      publishedBy: inserted.publishedBy,
      isUrgent: inserted.isUrgent,
      date: inserted.date,
      createdAt: inserted.createdAt,
    };

    logAuditAction(
      "Created Announcement: " + formatted.title,
      adminName || currentUser.name || "Admin",
      adminMobile || currentUser.mobile || "",
      formatted.title
    );

    return NextResponse.json({ success: true, announcement: formatted });
  } catch (err: any) {
    console.error("Error creating announcement:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create announcement" }, { status: 500 });
  }
}
