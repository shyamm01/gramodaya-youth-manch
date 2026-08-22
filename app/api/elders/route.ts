import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { validateRequestBody, elderCreateSchema } from "@/src/lib/validations";
import { logAuditAction } from "@/src/lib/authUtils";
import { requireAuth } from "@/src/lib/jwtAuth";
import { ensureSupabaseUrl } from "@/src/lib/supabaseStorage";
import { resolveVillageRef } from '@/src/lib/villageContext';

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
    // 1. Enforce RBAC Permission for Elder Management
    const auth = await requireAuth(req, 'elders:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

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

    // Verified against the villages table: the old `: 1` default was a village
    // that does not exist here, and the insert died on the foreign key.
    const numericVillageId = await resolveVillageRef(villageId);
    const cdnPhotoUrl = await ensureSupabaseUrl(photoUrl, "elders", "elder");

    const [inserted] = await db
      .insert(schema.elders)
      .values({
        villageId: numericVillageId,
        name: name.trim(),
        // age is NOT NULL in the schema and the admin form does not collect it,
        // so an omitted value must land as '' — the falsy check used to turn the
        // route's own "" default into a null and fail the insert.
        age: (age ?? '').trim(),
        role: role ? role.trim() : null,
        contribution: contribution ? contribution.trim() : null,
        photoUrl: cdnPhotoUrl || null,
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

    logAuditAction(
      "Added Elder: " + formatted.name,
      adminName || currentUser.name || "Admin",
      adminMobile || currentUser.mobile || "",
      formatted.name
    );

    return NextResponse.json({ success: true, elder: formatted });
  } catch (err: any) {
    console.error("Error creating elder:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create elder record" }, { status: 500 });
  }
}
