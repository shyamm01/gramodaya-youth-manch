import { NextResponse } from 'next/server';
import { logAuditAction, normalizeMobile, profileToMemberDTO, getSqlClient } from '@/src/lib/authUtils';
import { deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
import { getServerSupabase } from '@/src/lib/supabaseServer';
import { requireAuth } from '@/src/lib/jwtAuth';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Authenticate requester
    const auth = await requireAuth(req);
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const isSelf = String(currentUser.id) === String(id) || normalizeMobile(currentUser.mobile) === normalizeMobile(body.mobile || '');
    const isSuperOrAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

    // If changing roles, village, or status of someone else, require admin permissions
    if (!isSelf && !isSuperOrAdmin) {
      const permAuth = await requireAuth(req, 'members:update');
      if (!permAuth.success) return permAuth.response;
    }

    const {
      name,
      mobile,
      status,
      role,
      villageId,
      photoUrl,
      fatherName,
      dob,
      address,
      organizationName,
      adminName,
      adminMobile,
    } = body;

    const db = getDb();

    if (db) {
      const profileUpdateData: any = { updatedAt: new Date() };
      if (name !== undefined) profileUpdateData.fullName = name.trim();
      if (mobile !== undefined) profileUpdateData.mobile = normalizeMobile(mobile);
      if (status !== undefined) {
        profileUpdateData.status = status;
        profileUpdateData.isApproved = status === 'active';
      }
      if (body.systemRole !== undefined) {
        profileUpdateData.systemRole = body.systemRole;
        profileUpdateData.role = (body.systemRole === 'SUPER_ADMIN' || body.systemRole === 'ADMIN') ? 'ADMIN' : 'MEMBER';
      } else if (role !== undefined) {
        if (role === 'SUPER_ADMIN' || role === 'DISTRICT_ADMIN' || role === 'PANCHAYAT_ADMIN' || role === 'VILLAGE_ADMIN' || role === 'VILLAGE_MODERATOR' || role === 'ADMIN' || role === 'GUEST') {
          profileUpdateData.systemRole = role;
          profileUpdateData.role = (role === 'SUPER_ADMIN' || role === 'ADMIN') ? 'ADMIN' : 'MEMBER';
        } else {
          profileUpdateData.role = role;
          profileUpdateData.systemRole = role;
        }
      }
      if (photoUrl !== undefined) {
        profileUpdateData.avatarUrl = photoUrl;
      }
      if (body.email !== undefined) profileUpdateData.email = body.email ? body.email.trim() : null;
      if (fatherName !== undefined) profileUpdateData.fatherName = fatherName ? fatherName.trim() : null;
      if (dob !== undefined) profileUpdateData.dob = dob || null;
      if (body.gender !== undefined) profileUpdateData.gender = body.gender || null;
      if (villageId !== undefined && !isNaN(Number(villageId))) profileUpdateData.villageId = Number(villageId);
      if (body.houseNo !== undefined) profileUpdateData.houseNo = body.houseNo ? body.houseNo.trim() : null;
      if (body.street !== undefined) profileUpdateData.street = body.street ? body.street.trim() : null;
      if (body.pincode !== undefined) profileUpdateData.pincode = body.pincode ? body.pincode.trim() : null;
      if (body.occupation !== undefined) profileUpdateData.occupation = body.occupation ? body.occupation.trim() : null;
      if (body.designation !== undefined) profileUpdateData.designation = body.designation ? body.designation.trim() : null;
      if (body.politicalBackground !== undefined) profileUpdateData.politicalBackground = body.politicalBackground ? body.politicalBackground.trim() : null;
      if (body.bloodGroup !== undefined) profileUpdateData.bloodGroup = body.bloodGroup ? body.bloodGroup.trim() : null;

      // Update profiles
      try {
        await db.update(schema.profiles).set(profileUpdateData).where(eq(schema.profiles.id, id));
      } catch (profUpdateErr) {
        console.warn("Profile update note:", profUpdateErr);
      }
    }

    let updatedMember: any = { id, name, mobile };
    const sql = getSqlClient();
    if (sql) {
      const rows = await sql`
        SELECT p.*, v.org_name, v.org_name_hindi
        FROM public.profiles p
        LEFT JOIN public.villages v ON p.village_id = v.id
        WHERE p.id = ${id}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        updatedMember = profileToMemberDTO(rows[0]);
      }
    }

    logAuditAction(
      `Updated Member (${updatedMember?.name || id})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      updatedMember?.name || id
    );

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating member' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(req, props);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'members:delete');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const db = getDb();
    let photoToDelete: string | null = null;
    let memberName: string | null = null;

    if (db) {
      try {
        const [existing] = await db
          .select({ avatarUrl: schema.profiles.avatarUrl, fullName: schema.profiles.fullName })
          .from(schema.profiles)
          .where(eq(schema.profiles.id, id));

        if (existing?.avatarUrl) {
          photoToDelete = existing.avatarUrl;
        }
        memberName = existing?.fullName || null;

        await db.delete(schema.profiles).where(eq(schema.profiles.id, id));
      } catch (delErr) {
        console.warn("Profiles delete note:", delErr);
      }
    }

    // Best-effort: also remove the backing Supabase Auth identity so the
    // mobile/email doesn't stay permanently unusable for re-registration.
    const supabase = getServerSupabase();
    if (supabase) {
      supabase.auth.admin.deleteUser(id).catch(() => {});
    }

    if (photoToDelete) {
      deleteSupabaseObjectByUrl(photoToDelete).catch(() => {});
    }

    if (memberName) {
      logAuditAction(
        `Deleted Member (${memberName})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        memberName
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting member' }, { status: 500 });
  }
}
