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
          pincode: v?.pincode || "241125",
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
          role: p.systemRole === "MEMBER" ? "MEMBER" : "ADMIN",
          systemRole: p.systemRole || "MEMBER",
          isApproved: p.status === 'active',
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
      status = "active",
      role = "MEMBER",
      systemRole = "MEMBER",
      adminName,
      adminMobile,
    } = validation.data as any;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
    }

    const cleanMobileDigits = normalizeMobile(mobile || "");
    const formattedMobile = "+91 " + cleanMobileDigits.slice(0, 5) + " " + cleanMobileDigits.slice(5);
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    // Check duplicate in profiles by mobile or email
    let existingProfile: any = null;
    try {
      const conditions = [like(schema.profiles.mobile, "%" + cleanMobileDigits + "%")];
      if (cleanEmail) {
        conditions.push(eq(schema.profiles.email, cleanEmail));
      }
      const found = await db
        .select()
        .from(schema.profiles)
        .where(or(...conditions))
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
          error: `An account is already registered with this mobile (${formattedMobile}) or email (${existingProfile.email || cleanEmail}). Status: ${existingProfile.status}.`,
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

    const { getServerSupabase } = await import("@/src/lib/supabaseServer");
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Authentication service unavailable." }, { status: 500 });
    }

    // Determine application origin for email redirect link
    let origin = "http://localhost:3000";
    try {
      const originHeader = req.headers.get("origin") || req.headers.get("referer");
      if (originHeader) {
        origin = new URL(originHeader).origin;
      }
    } catch {
      origin = "http://localhost:3000";
    }

    const redirectTo = `${origin}/auth/callback?next=/auth/update-password`;

    let createdUser: any = null;
    let inviteLink: string | null = null;
    let inviteSent = false;

    if (cleanEmail) {
      // 1. Try inviting user by email (sends Supabase invitation email with password setup link)
      try {
        const { data: inviteData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(cleanEmail, {
          data: {
            full_name: name.trim(),
            mobile: cleanMobileDigits,
            status: status || "active",
            system_role: systemRole || role || "MEMBER",
            role: role || "MEMBER",
          },
          redirectTo,
        });

        if (!inviteErr && inviteData?.user) {
          createdUser = inviteData.user;
          inviteSent = true;
        } else if (inviteErr) {
          console.warn("inviteUserByEmail note, falling back to createUser + generateLink:", inviteErr.message);
        }
      } catch (invEx) {
        console.warn("inviteUserByEmail exception:", invEx);
      }

      // 2. If invitation was not sent directly, create the user and generate a verification/setup link
      if (!createdUser) {
        const initialPassword = password && password.length >= 6 ? password : crypto.randomBytes(16).toString("hex");
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: initialPassword,
          email_confirm: false,
          user_metadata: {
            full_name: name.trim(),
            mobile: cleanMobileDigits,
            status: status || "active",
            system_role: systemRole || role || "MEMBER",
            role: role || "MEMBER",
          },
        });

        if (createErr || !created?.user) {
          return NextResponse.json(
            { success: false, error: createErr?.message || "Failed to create user authentication record." },
            { status: 409 }
          );
        }
        createdUser = created.user;

        // Generate invitation / password recovery setup link
        try {
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: "invite",
            email: cleanEmail,
            options: { redirectTo },
          });

          if (linkData?.properties?.action_link) {
            inviteLink = linkData.properties.action_link;
          } else {
            // Fallback to recovery link
            const { data: recData } = await supabase.auth.admin.generateLink({
              type: "recovery",
              email: cleanEmail,
              options: { redirectTo },
            });
            if (recData?.properties?.action_link) {
              inviteLink = recData.properties.action_link;
            }
          }
        } catch (linkGenErr) {
          console.warn("generateLink fallback notice:", linkGenErr);
        }
      }
    } else {
      // Mobile-only identity
      const syntheticEmail = `${cleanMobileDigits}@gym.org`;
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
        return NextResponse.json(
          { success: false, error: createErr?.message || "Failed to create member user record." },
          { status: 409 }
        );
      }
      createdUser = created.user;
    }

    const profileId = createdUser.id;

    // Trigger inserts a base row from user_metadata; fill in the rest authoritatively.
    let insertedRecord: any = null;
    try {
      const [prof] = await db
        .update(schema.profiles)
        .set({
          fullName: name.trim(),
          avatarUrl: cdnPhotoUrl || photoUrl || null,
          mobile: formattedMobile,
          email: cleanEmail || null,
          fatherName: fatherName ? fatherName.trim() : null,
          dob: dob || null,
          gender: gender || null,
          villageId: numericVillageId || 8,
          houseNo: houseNo || null,
          street: street || null,
          occupation: occupation || null,
          designation: designation || null,
          politicalBackground: politicalBackground || null,
          bloodGroup: bloodGroup || null,
          status: (status || "active") as any,
          systemRole: (systemRole || (role === 'ADMIN' ? 'ADMIN' : 'MEMBER')) as any,
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
      email: cleanEmail || "",
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
      status: status || "active",
      role: role || "MEMBER",
      systemRole: systemRole || "MEMBER",
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

    logAuditAction("New Member Profile: " + formatted.name, adminName || formatted.name, adminMobile || formatted.mobile, formatted.name);

    if (db) {
      try {
        await db.insert(schema.auditLogs).values({
          userName: adminName || 'Administrator',
          action: 'MEMBER_REGISTERED',
          details: `Registered new member account for ${formatted.name} (Email: ${cleanEmail || 'None'}, Mobile: ${formatted.mobile}) with authority role ${formatted.systemRole}. Email invitation & password setup link generated.`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          villageId: numericVillageId || 1,
          userId: profileId,
          timestamp: new Date(),
        });
      } catch (auditErr) {
        console.warn("Audit log insert note on member create:", auditErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: formatted,
      token,
      inviteLink,
      inviteSent,
      message: cleanEmail
        ? `Member registered! An invitation & password setup link has been sent to ${cleanEmail}. The member can also log in anytime with Google using this email.`
        : `Member registered successfully!`,
    });
  } catch (err: any) {
    console.error("Error creating member profile:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to register member" }, { status: 500 });
  }
}
