import { NextResponse } from "next/server";
import { getDb } from "@/src/db";
import * as schema from "@/src/db/schema";
import { desc, like, eq, or } from "drizzle-orm";
import { validateRequestBody, memberCreateSchema } from "@/src/lib/validations";
import { normalizeMobile, hashPassword, logAuditAction } from "@/src/lib/authUtils";
import { signJwtToken } from "@/src/lib/jwtAuth";
import crypto from "crypto";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ success: true, members: [] });

    // 1. Primary Source: Query profiles table
    let profileRows: any[] = [];
    try {
      profileRows = await db.query.profiles.findMany({
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
        orderBy: [desc(schema.profiles.createdAt)],
      });
    } catch (profErr) {
      console.warn("Profiles query fallback notice:", profErr);
    }

    // If profiles exist, return formatted profile records
    if (profileRows && profileRows.length > 0) {
      const formattedProfiles = profileRows.map((p) => {
        const v = p.village;
        const gp = v?.gramPanchayat;
        const dist = gp?.district;
        const st = dist?.state;

        const fullAddress = p.houseNo
          ? `${p.houseNo}, ${p.street ? p.street + ', ' : ''}${v?.nameHindi || v?.name || 'रसूलपुर'}`
          : `${v?.nameHindi || v?.name || 'रसूलपुर'}, ग्राम पंचायत ${gp?.nameHindi || gp?.name || 'बहेरा'}, जिला ${dist?.nameHindi || dist?.name || 'हरदोई'}`;

        return {
          id: String(p.id),
          villageId: p.villageId ? String(p.villageId) : "8",
          name: p.fullName || "Member",
          mobile: p.mobile || "",
          email: p.email || "",
          status: p.status || "pending",
          photoUrl: p.avatarUrl || "",
          organizationName: v?.orgNameHindi || v?.orgName || "ग्रामोदय यूथ मंच",
          fatherName: p.fatherName || "",
          dob: p.dob || "",
          gender: p.gender || "",
          address: fullAddress,
          pincode: p.pincode || v?.pincode || "241125",
          state: st?.nameHindi || st?.name || "Uttar Pradesh",
          district: dist?.nameHindi || dist?.name || "Hardoi",
          block: v?.blockNameHindi || v?.blockName || "Hardoi",
          gramPanchayat: gp?.nameHindi || gp?.name || "Bahera",
          villageName: v?.nameHindi || v?.name || "Rasoolpur",
          postOffice: v?.postOffice || gp?.postOffice || "Bahera Rasoolpur",
          houseNo: p.houseNo || "",
          street: p.street || "",
          occupation: p.occupation || "",
          designation: p.designation || "",
          politicalBackground: p.politicalBackground || "",
          bloodGroup: p.bloodGroup || "",
          role: p.role || "MEMBER",
          systemRole: p.systemRole || "MEMBER",
          isApproved: p.isApproved || p.status === 'active',
          createdAt: p.createdAt,
        };
      });

      return NextResponse.json({ success: true, members: formattedProfiles });
    }

    return NextResponse.json({ success: true, members: [] });
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
      password,
      photoUrl,
      fatherName,
      dob,
      gender,
      email,
      address,
      pincode,
      houseNo,
      street,
      villageId,
      villageName,
      gramPanchayat,
      district,
      state,
      occupation,
      designation,
      politicalBackground,
      bloodGroup,
      status = "pending",
      role = "MEMBER",
      systemRole = "MEMBER",
    } = validation.data as any;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    const cleanMobileDigits = normalizeMobile(mobile || "");
    const formattedMobile = "+91 " + cleanMobileDigits.slice(0, 5) + " " + cleanMobileDigits.slice(5);

    // Check duplicate in profiles by mobile or email
    let existingProfile: any = null;
    try {
      const found = await db
        .select()
        .from(schema.profiles)
        .where(
          or(
            like(schema.profiles.mobile, "%" + cleanMobileDigits + "%"),
            email ? eq(schema.profiles.email, email.trim().toLowerCase()) : undefined
          )
        )
        .limit(1);
      if (found && found.length > 0) existingProfile = found[0];
    } catch (e) {
      // Fallback check in members table
      try {
        const foundMem = await db
          .select()
          .from(schema.members)
          .where(like(schema.members.mobile, "%" + cleanMobileDigits + "%"))
          .limit(1);
        if (foundMem && foundMem.length > 0) existingProfile = foundMem[0];
      } catch (me) {}
    }

    if (existingProfile) {
      const token = await signJwtToken({
        id: String(existingProfile.id),
        name: existingProfile.fullName || existingProfile.name,
        mobile: existingProfile.mobile,
        email: existingProfile.email || undefined,
        role: existingProfile.systemRole || existingProfile.role || "MEMBER",
        systemRole: existingProfile.systemRole || existingProfile.role || "MEMBER",
        villageId: existingProfile.villageId ? String(existingProfile.villageId) : "1",
        isAdmin: existingProfile.systemRole === "ADMIN" || existingProfile.systemRole === "SUPER_ADMIN",
      });

      return NextResponse.json(
        {
          error: "यह खाता (" + formattedMobile + ") पहले से पंजीकृत है [स्थिति: " + (existingProfile.status === "active" ? "सक्रिय" : "लंबित") + "]।",
          alreadyRegistered: true,
          member: existingProfile,
          token,
        },
        { status: 409 }
      );
    }

    const numericVillageId = villageId && !isNaN(Number(villageId)) ? Number(villageId) : null;

    const { ensureSupabaseUrl } = await import("@/src/lib/supabaseStorage");
    const cdnPhotoUrl = photoUrl ? await ensureSupabaseUrl(photoUrl, "profiles", "member") : null;

    // profiles.id is a foreign key to auth.users(id), so a profile can only be created
    // through a real Supabase Auth user — mobile-only members get a synthetic <mobile>@gym.org identity.
    const { getServerSupabase } = await import("@/src/lib/supabaseServer");
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "प्रमाणीकरण सेवा अनुपलब्ध है।" }, { status: 500 });
    }

    const syntheticEmail = email ? email.trim().toLowerCase() : `${cleanMobileDigits}@gym.org`;
    const finalPassword = password && password.length >= 4 ? password : crypto.randomBytes(24).toString("hex");

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: syntheticEmail,
      password: finalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
        mobile: cleanMobileDigits,
        status,
        system_role: systemRole,
        role,
      },
    });

    if (createErr || !created?.user) {
      if (createErr?.code === "no_authorization" || createErr?.status === 401) {
        console.error("Member creation blocked: SUPABASE_SERVICE_ROLE_KEY is not configured.");
        return NextResponse.json(
          { success: false, error: "सर्वर कॉन्फ़िगरेशन त्रुटि। कृपया व्यवस्थापक से संपर्क करें।" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, error: "यह खाता पहले से पंजीकृत हो सकता है अथवा खाता बनाने में त्रुटि हुई।" },
        { status: 409 }
      );
    }

    const profileId = created.user.id;

    // Trigger inserts a base row from user_metadata; fill in the rest authoritatively.
    let insertedRecord: any = null;
    try {
      const [prof] = await db
        .update(schema.profiles)
        .set({
          fullName: name.trim(),
          avatarUrl: cdnPhotoUrl || photoUrl || null,
          mobile: formattedMobile,
          email: email ? email.trim().toLowerCase() : null,
          fatherName: fatherName ? fatherName.trim() : null,
          dob: dob || null,
          gender: gender || null,
          villageId: numericVillageId || 8,
          pincode: pincode || "241125",
          houseNo: houseNo || null,
          street: street || null,
          occupation: occupation || null,
          designation: designation || null,
          politicalBackground: politicalBackground || null,
          bloodGroup: bloodGroup || null,
          status: status as any,
          role: role as any,
          systemRole: systemRole as any,
          isApproved: status === 'active',
        })
        .where(eq(schema.profiles.id, profileId))
        .returning();
      insertedRecord = prof;
    } catch (profUpdateErr) {
      console.warn("Profiles update-after-create error:", profUpdateErr);
    }

    const formatted = {
      id: insertedRecord ? String(insertedRecord.id) : profileId,
      villageId: String(numericVillageId || 1),
      name: name.trim(),
      mobile: formattedMobile,
      email: email ? email.trim() : "",
      photoUrl: cdnPhotoUrl || photoUrl || "",
      fatherName: fatherName ? fatherName.trim() : "",
      dob: dob || "",
      gender: gender || "",
      address: address || "",
      pincode: pincode || "241125",
      state: state || "Uttar Pradesh",
      district: district || "Hardoi",
      block: "Hardoi",
      gramPanchayat: gramPanchayat || "Bahera",
      villageName: villageName || "Rasoolpur",
      postOffice: "Bahera Rasoolpur",
      houseNo: houseNo || "",
      street: street || "",
      occupation: occupation || "",
      designation: designation || "",
      politicalBackground: politicalBackground || "",
      bloodGroup: bloodGroup || "",
      status: status,
      role: role,
      systemRole: systemRole,
      isApproved: status === 'active',
      organizationName: "ग्रामोदय यूथ मंच",
      createdAt: new Date(),
    };

    const token = await signJwtToken({
      id: formatted.id,
      name: formatted.name,
      mobile: formatted.mobile,
      email: formatted.email,
      role: formatted.systemRole,
      systemRole: formatted.systemRole,
      villageId: formatted.villageId,
      isAdmin: formatted.systemRole === "ADMIN" || formatted.systemRole === "SUPER_ADMIN",
    });

    logAuditAction("New Member Profile: " + formatted.name, formatted.name, formatted.mobile, formatted.name);

    return NextResponse.json({ success: true, member: formatted, token });
  } catch (err: any) {
    console.error("Error creating member profile:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to register member" }, { status: 500 });
  }
}
