import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, publicInfoCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, publicInfos: [] });

    const rows = await db.select().from(schema.publicInfos).orderBy(desc(schema.publicInfos.id));

    const formatted = rows.map((p) => ({
      id: String(p.id),
      villageId: p.villageId ? String(p.villageId) : "1",
      title: p.title,
      description: p.description,
      category: p.category,
      submitterName: p.submitterName,
      submitterMobile: p.submitterMobile,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ success: true, publicInfos: formatted });
  } catch (err: any) {
    console.error("Error fetching public info:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch public info" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, publicInfoCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      title,
      description,
      category = "General",
      submitterName,
      submitterMobile,
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
      .insert(schema.publicInfos)
      .values({
        villageId: numericVillageId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        submitterName: submitterName.trim(),
        submitterMobile: submitterMobile.trim(),
        status: "approved",
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      title: inserted.title,
      description: inserted.description,
      category: inserted.category,
      submitterName: inserted.submitterName,
      submitterMobile: inserted.submitterMobile,
      status: inserted.status,
      createdAt: inserted.createdAt,
    };

    logAuditAction("Created Public Info: " + formatted.title, submitterName, submitterMobile, formatted.title);

    return NextResponse.json({ success: true, publicInfo: formatted });
  } catch (err: any) {
    console.error("Error creating public info:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create public info" }, { status: 500 });
  }
}
