import { validateRequestBody, villageCreateSchema } from '@/src/lib/validations';
import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Read from the database, not the JSON store. The store carried a legacy
    // row with a slug-style id ("vil_rasoolpur") while every member, event and
    // grievance references the numeric village id — so lookups like
    // villages.find(v => v.id === member.villageId) never matched, and the
    // members table showed "Main Unit" for everyone.
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: true, villages: [] });
    }

    const rows = await db.select().from(schema.villages).orderBy(asc(schema.villages.id));

    return NextResponse.json({
      success: true,
      villages: rows.map((v) => ({
        ...v,
        id: String(v.id),
        gramPanchayatId: v.gramPanchayatId ? String(v.gramPanchayatId) : undefined,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching villages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, 'village:manage', 'ADMIN');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const validation = await validateRequestBody(req, villageCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      name,
      nameHindi,
      gramPanchayatName,
      gramPanchayatNameHindi,
      districtName,
      districtNameHindi,
      stateName,
      stateNameHindi,
      blockName,
      blockNameHindi,
      pincode,
      postOffice,
      orgName,
      orgNameHindi,
      sloganHindi,
      taglineHindi,
      adminName,
      adminMobile,
    } = validation.data;

    if (!name || !nameHindi) {
      return NextResponse.json({ error: 'Village name in English and Hindi is required.' }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database connection unavailable.' }, { status: 500 });
    }

    // Slugs are unique in the schema, so a repeated village name would fail the
    // insert on a constraint rather than telling the admin what happened.
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = baseSlug || `village-${Date.now()}`;
    const [clash] = await db
      .select({ id: schema.villages.id })
      .from(schema.villages)
      .where(eq(schema.villages.slug, slug))
      .limit(1);
    if (clash) {
      return NextResponse.json(
        { error: `A village with the slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const [inserted] = await db
      .insert(schema.villages)
      .values({
        slug,
        name: name.trim(),
        nameHindi: nameHindi.trim(),
        blockName: blockName ? blockName.trim() : null,
        blockNameHindi: blockNameHindi ? blockNameHindi.trim() : null,
        pincode: pincode ? pincode.trim() : null,
        postOffice: postOffice ? postOffice.trim() : null,
        orgName: orgName ? orgName.trim() : `Gramodaya Youth Manch ${name}`,
        orgNameHindi: orgNameHindi ? orgNameHindi.trim() : `ग्रामोदय यूथ मंच ${nameHindi}`,
        sloganHindi: sloganHindi ? sloganHindi.trim() : 'सशक्त युवा, समर्थ ग्राम',
        taglineHindi: taglineHindi ? taglineHindi.trim() : 'एक कदम समग्र ग्राम विकास की ओर',
        isActive: true,
      })
      .returning();

    const newVillage = { ...inserted, id: String(inserted.id) };

    logAuditAction(
      `Added New Village: ${newVillage.nameHindi} (${newVillage.name})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      newVillage.nameHindi
    );

    return NextResponse.json({ success: true, village: newVillage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating village' }, { status: 500 });
  }
}
