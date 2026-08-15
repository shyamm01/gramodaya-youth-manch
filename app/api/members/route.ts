import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc, like } from "drizzle-orm";
import { validateRequestBody, memberCreateSchema } from "@/src/lib/validations";
import { normalizeMobile, hashPassword, logAuditAction } from "@/src/lib/authUtils";
import { signJwtToken } from "@/src/lib/jwtAuth";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, members: [] });

    const rows = await db.query.members.findMany({
      with: {
        village: {
          with: {
            gramPanchayat: {
              with: {
                district: {
                  with: {
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [desc(schema.members.id)],
    });

    const formatted = rows.map((m) => {
      const v = m.village;
      const gp = v?.gramPanchayat;
      const dist = gp?.district;
      const st = dist?.state;

      return {
        id: String(m.id),
        villageId: m.villageId ? String(m.villageId) : "1",
        name: m.name,
        mobile: m.mobile,
        email: m.email || "",
        status: m.status,
        photoUrl: m.photoUrl || "",
        organizationName: v?.orgNameHindi || v?.orgName || "ग्रामोदय यूथ मंच",
        fatherName: m.fatherName || "",
        dob: m.dob || "",
        gender: m.gender || "",
        address: m.address || "ग्राम रसूलपुर, ग्राम पंचायत बहेरा",
        pincode: m.pincode || v?.pincode || gp?.pincode || "241125",
        state: st?.name || "Uttar Pradesh",
        district: dist?.name || "Hardoi",
        block: v?.blockName || gp?.blockName || "Hardoi",
        gramPanchayat: gp?.name || "Bahera",
        villageName: v?.name || "Rasoolpur",
        postOffice: v?.postOffice || gp?.postOffice || "Bahera Rasoolpur",
        houseNo: m.houseNo || "",
        street: m.street || "",
        occupation: m.occupation || "",
        designation: m.designation || "",
        politicalBackground: m.politicalBackground || "",
        bloodGroup: m.bloodGroup || "",
        role: m.role || "MEMBER",
        systemRole: m.systemRole || "MEMBER",
        createdAt: m.createdAt,
      };
    });

    return NextResponse.json({ success: true, members: formatted });
  } catch (err: any) {
    console.error("Error fetching members:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, memberCreateSchema);
    if (!validation.success) {
      return validation.response;
    }
    const {
      name,
      mobile,
      photoUrl,
      fatherName,
      dob,
      gender,
      email,
      password,
      address,
      pincode,
      houseNo,
      street,
      villageId,
      occupation,
      designation,
      politicalBackground,
      bloodGroup,
      status = "active",
      role = "MEMBER",
      systemRole = "MEMBER",
    } = validation.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    const cleanMobileDigits = normalizeMobile(mobile || "");
    const formattedMobile = "+91 " + cleanMobileDigits.slice(0, 5) + " " + cleanMobileDigits.slice(5);
    const passwordHash = password ? hashPassword(password) : null;

    // Check duplicate in PostgreSQL
    const existing = await db
      .select()
      .from(schema.members)
      .where(like(schema.members.mobile, "%" + cleanMobileDigits + "%"))
      .limit(1);

    if (existing && existing.length > 0) {
      const ex = existing[0];
      const token = await signJwtToken({
        id: String(ex.id),
        name: ex.name,
        mobile: ex.mobile,
        email: ex.email || undefined,
        role: ex.systemRole || ex.role || "MEMBER",
        systemRole: ex.systemRole || ex.role || "MEMBER",
        villageId: ex.villageId ? String(ex.villageId) : "1",
        isAdmin: ex.systemRole === "ADMIN" || ex.systemRole === "SUPER_ADMIN",
      });

      return NextResponse.json(
        {
          error: "यह मोबाइल नंबर (" + formattedMobile + ") पहले से पंजीकृत है [स्थिति: " + (ex.status === "active" ? "सक्रिय" : "लंबित") + "]।",
          alreadyRegistered: true,
          member: ex,
          token,
        },
        { status: 409 }
      );
    }

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : 1;

    const [inserted] = await db
      .insert(schema.members)
      .values({
        villageId: numericVillageId,
        name: name.trim(),
        mobile: formattedMobile,
        email: email ? email.trim() : null,
        passwordHash,
        status: status as any,
        photoUrl: photoUrl || null,
        fatherName: fatherName ? fatherName.trim() : null,
        dob: dob || null,
        gender: gender || null,
        address: address || "ग्राम रसूलपुर, ग्राम पंचायत बहेरा",
        pincode: pincode || "241125",
        houseNo: houseNo || null,
        street: street || null,
        occupation: occupation || null,
        designation: designation || null,
        politicalBackground: politicalBackground || null,
        bloodGroup: bloodGroup || null,
        role: role as any,
        systemRole: systemRole as any,
      })
      .returning();

    // Query village details for response
    const villageRecord = await db.query.villages.findFirst({
      where: (v, { eq }) => eq(v.id, inserted.villageId),
      with: {
        gramPanchayat: {
          with: {
            district: {
              with: {
                state: true,
              },
            },
          },
        },
      },
    });

    const gp = villageRecord?.gramPanchayat;
    const dist = gp?.district;
    const st = dist?.state;

    const formatted = {
      id: String(inserted.id),
      villageId: inserted.villageId ? String(inserted.villageId) : "1",
      name: inserted.name,
      mobile: inserted.mobile,
      email: inserted.email || "",
      photoUrl: inserted.photoUrl || "",
      fatherName: inserted.fatherName || "",
      dob: inserted.dob || "",
      gender: inserted.gender || "",
      address: inserted.address || "",
      pincode: inserted.pincode || "241125",
      state: st?.name || "Uttar Pradesh",
      district: dist?.name || "Hardoi",
      block: villageRecord?.blockName || gp?.blockName || "Hardoi",
      gramPanchayat: gp?.name || "Bahera",
      villageName: villageRecord?.name || "Rasoolpur",
      postOffice: villageRecord?.postOffice || gp?.postOffice || "Bahera Rasoolpur",
      houseNo: inserted.houseNo || "",
      street: inserted.street || "",
      occupation: inserted.occupation || "",
      designation: inserted.designation || "",
      politicalBackground: inserted.politicalBackground || "",
      bloodGroup: inserted.bloodGroup || "",
      status: inserted.status,
      role: inserted.role,
      systemRole: inserted.systemRole,
      organizationName: villageRecord?.orgNameHindi || villageRecord?.orgName || "ग्रामोदय यूथ मंच",
      createdAt: inserted.createdAt,
    };

    const token = await signJwtToken({
      id: formatted.id,
      name: formatted.name,
      mobile: formatted.mobile,
      email: formatted.email,
      role: formatted.systemRole,
      systemRole: formatted.systemRole,
      villageId: formatted.villageId,
      isAdmin: false,
    });

    logAuditAction("New Member Registration: " + formatted.name, formatted.name, formatted.mobile, formatted.name);

    return NextResponse.json({ success: true, member: formatted, token });
  } catch (err: any) {
    console.error("Error creating member:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to register member" }, { status: 500 });
  }
}
