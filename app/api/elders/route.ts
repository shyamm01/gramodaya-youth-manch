import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, elderCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, elders: [] });

    const rows = await db.select().from(schema.elders).orderBy(desc(schema.elders.id));

    const formatted = rows.map((el) => ({
      id: String(el.id),
      villageId: el.villageId ? String(el.villageId) : "1",
      name: el.name,
      age: el.age || "",
      role: el.role || "",
      contribution: el.contribution || "",
      photoUrl: el.photoUrl || "",
      createdAt: el.createdAt,
    }));

    return NextResponse.json({ success: true, elders: formatted });
  } catch (err: any) {
    console.error("Error fetching elders:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch elders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, elderCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      name,
      age = "",
      role = "",
      contribution = "",
      photoUrl = "",
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
      .insert(schema.elders)
      .values({
        villageId: numericVillageId,
        name: name.trim(),
        age: age.trim(),
        role: role.trim(),
        contribution: contribution.trim(),
        photoUrl: photoUrl.trim() || null,
      })
      .returning();

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      name: inserted.name,
      age: inserted.age || "",
      role: inserted.role || "",
      contribution: inserted.contribution || "",
      photoUrl: inserted.photoUrl || "",
      createdAt: inserted.createdAt,
    };

    logAuditAction("Added Elder Record: " + formatted.name, adminName || "Admin", adminMobile || "", formatted.name);

    return NextResponse.json({ success: true, elder: formatted });
  } catch (err: any) {
    console.error("Error creating elder:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create elder record" }, { status: 500 });
  }
}
