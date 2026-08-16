import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction, normalizeMobile } from '@/src/lib/serverStore';
import { deleteSupabaseObjectByUrl } from '@/src/lib/supabaseStorage';
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
      if (role !== undefined) {
        profileUpdateData.role = role;
        profileUpdateData.systemRole = role;
      }
      if (photoUrl !== undefined) {
        profileUpdateData.avatarUrl = photoUrl;
      }
      if (fatherName !== undefined) profileUpdateData.fatherName = fatherName.trim();
      if (dob !== undefined) profileUpdateData.dob = dob;
      if (villageId !== undefined && !isNaN(Number(villageId))) profileUpdateData.villageId = Number(villageId);

      // Update profiles
      try {
        await db.update(schema.profiles).set(profileUpdateData).where(eq(schema.profiles.id, id));
      } catch (profUpdateErr) {
        console.warn("Profile update note:", profUpdateErr);
      }
    }

    const store = loadStore();
    const index = store.members.findIndex((m) => m.id === id);

    let updatedMember: any;
    if (index !== -1) {
      const prev = store.members[index];
      const newRole = isSuperOrAdmin && role !== undefined ? role : (prev.role || 'MEMBER');
      const newVillageId = villageId !== undefined ? villageId : (prev.villageId || 'vil_rasoolpur');
      const cleanMobile = mobile !== undefined ? mobile.trim() : prev.mobile;
      const cleanName = name !== undefined ? name.trim() : prev.name;
      const cleanPhoto = photoUrl !== undefined ? photoUrl : prev.photoUrl;

      updatedMember = {
        ...prev,
        name: cleanName,
        mobile: cleanMobile,
        status: status !== undefined ? status : prev.status,
        role: newRole,
        villageId: newVillageId,
        photoUrl: cleanPhoto,
        fatherName: fatherName !== undefined ? fatherName : prev.fatherName,
        dob: dob !== undefined ? dob : prev.dob,
        address: address !== undefined ? address : prev.address,
        organizationName: organizationName !== undefined ? organizationName : prev.organizationName,
      };

      store.members[index] = updatedMember;

      // Handle Admin synchronization when role changes
      const normDigits = normalizeMobile(cleanMobile);
      if (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') {
        const villageObj = (store.villages || []).find((v) => v.id === newVillageId);
        const existingAdminIdx = store.admins.findIndex(
          (a) => a.id === id || normalizeMobile(a.mobile) === normDigits
        );

        const adminData = {
          id: id,
          name: cleanName,
          mobile: cleanMobile,
          role: newRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Village Admin',
          systemRole: newRole as 'ADMIN' | 'SUPER_ADMIN',
          village: villageObj ? villageObj.nameHindi : 'रसूलपुर',
          villageId: newVillageId,
          gramPanchayat: villageObj ? (villageObj.gramPanchayatNameHindi || villageObj.gramPanchayatName || 'बहेरा') : 'बहेरा',
          photoUrl: cleanPhoto || '',
          isHead: newRole === 'SUPER_ADMIN',
        };

        if (existingAdminIdx >= 0) {
          store.admins[existingAdminIdx] = {
            ...store.admins[existingAdminIdx],
            ...adminData,
          };
        } else {
          store.admins.push(adminData);
        }
      } else if (newRole === 'MEMBER') {
        store.admins = store.admins.filter(
          (a) => a.id !== id && normalizeMobile(a.mobile) !== normDigits
        );
      }

      saveStore(store);
    }

    logAuditAction(
      `Updated Member (${updatedMember?.name || id})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      updatedMember?.name || id
    );

    return NextResponse.json({ success: true, member: updatedMember || { id, name, mobile } });
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

    if (db) {
      try {
        const [existing] = await db
          .select({ avatarUrl: schema.profiles.avatarUrl })
          .from(schema.profiles)
          .where(eq(schema.profiles.id, id));

        if (existing?.avatarUrl) {
          photoToDelete = existing.avatarUrl;
        }

        await db.delete(schema.profiles).where(eq(schema.profiles.id, id));
      } catch (delErr) {
        console.warn("Profiles delete note:", delErr);
      }
    }

    const store = loadStore();
    const member = store.members.find((m) => m.id === id);
    if (member?.photoUrl && !photoToDelete) {
      photoToDelete = member.photoUrl;
    }

    store.members = store.members.filter((m) => m.id !== id);
    store.admins = store.admins.filter((a) => a.id !== id);
    saveStore(store);

    if (photoToDelete) {
      deleteSupabaseObjectByUrl(photoToDelete).catch(() => {});
    }

    if (member) {
      logAuditAction(
        `Deleted Member (${member.name})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        member.name
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting member' }, { status: 500 });
  }
}
