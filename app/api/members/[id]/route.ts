import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction, normalizeMobile } from '@/src/lib/serverStore';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
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

    const store = loadStore();
    const index = store.members.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'सदस्य नहीं मिला।' }, { status: 404 });
    }

    const prev = store.members[index];
    const newRole = role !== undefined ? role : (prev.role || 'MEMBER');
    const newVillageId = villageId !== undefined ? villageId : (prev.villageId || 'vil_rasoolpur');
    const cleanMobile = mobile !== undefined ? mobile.trim() : prev.mobile;
    const cleanName = name !== undefined ? name.trim() : prev.name;
    const cleanPhoto = photoUrl !== undefined ? photoUrl : prev.photoUrl;

    const updatedMember = {
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
      // Demote from Admin: remove from store.admins if not head default admin
      store.admins = store.admins.filter(
        (a) => a.id !== id && normalizeMobile(a.mobile) !== normDigits
      );
    }

    saveStore(store);

    logAuditAction(
      `Updated Member (${updatedMember.name}) [Role: ${newRole}, Village: ${newVillageId}]`,
      adminName || 'Admin',
      adminMobile || '',
      updatedMember.name
    );

    return NextResponse.json({ success: true, member: updatedMember, admins: store.admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating member' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const store = loadStore();
    const member = store.members.find((m) => m.id === id);
    if (!member) {
      return NextResponse.json({ error: 'सदस्य नहीं मिला।' }, { status: 404 });
    }

    const normDigits = normalizeMobile(member.mobile);
    store.members = store.members.filter((m) => m.id !== id);
    store.admins = store.admins.filter(
      (a) => a.id !== id && normalizeMobile(a.mobile) !== normDigits
    );
    saveStore(store);

    logAuditAction(
      `Deleted Member (${member.name})`,
      adminName || 'Admin',
      adminMobile || '',
      member.name
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting member' }, { status: 500 });
  }
}
