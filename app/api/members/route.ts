import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction, normalizeMobile } from '@/src/lib/serverStore';
import { syncToSupabase } from '@/src/lib/supabaseServer';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, members: store.members });
}

export async function POST(req: Request) {
  try {
    const {
      name,
      mobile,
      photoUrl,
      fatherName,
      dob,
      address,
      villageId,
      occupation,
      designation,
      politicalBackground,
      bloodGroup,
      status = 'pending',
      organizationName = 'ग्रामोदय यूथ मंच',
      adminName,
      adminMobile,
      createdAt,
    } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'कृपया सदस्य का पूरा नाम दर्ज करें।' }, { status: 400 });
    }

    const cleanMobileDigits = normalizeMobile(mobile || '');
    if (!cleanMobileDigits || cleanMobileDigits.length < 10) {
      return NextResponse.json({ error: 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' }, { status: 400 });
    }

    const store = loadStore();

    // Check if mobile number is already registered
    const existingIndex = store.members.findIndex(
      (m) => normalizeMobile(m.mobile) === cleanMobileDigits
    );

    const formattedMobile = `+91 ${cleanMobileDigits.slice(0, 5)} ${cleanMobileDigits.slice(5)}`;
    const effectiveVillageId = villageId || (store.villages && store.villages[0] ? store.villages[0].id : 'vil_rasoolpur');

    if (existingIndex >= 0) {
      const existing = store.members[existingIndex];
      return NextResponse.json(
        {
          error: `यह मोबाइल नंबर (${formattedMobile}) पहले से पंजीकृत है [स्थिति: ${existing.status === 'active' ? 'सक्रिय' : 'लंबित'}]।`,
          alreadyRegistered: true,
          member: existing,
        },
        { status: 409 }
      );
    }

    const newMember = {
      id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      villageId: effectiveVillageId,
      name: name.trim(),
      mobile: formattedMobile,
      photoUrl: photoUrl || '',
      fatherName: fatherName ? fatherName.trim() : '',
      dob: dob ? dob.trim() : '',
      address: address ? address.trim() : 'ग्राम रसूलपुर, ग्राम पंचायत बहेरा',
      occupation: occupation ? occupation.trim() : '',
      designation: designation ? designation.trim() : '',
      politicalBackground: politicalBackground ? politicalBackground.trim() : '',
      bloodGroup: bloodGroup ? bloodGroup.trim() : '',
      status: (status === 'active' ? 'active' : 'pending') as 'active' | 'pending',
      role: 'MEMBER' as const, // User registers themselves -> Default role is "MEMBER"
      systemRole: 'MEMBER' as const,
      organizationName: organizationName || 'ग्रामोदय यूथ मंच',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    };

    store.members.push(newMember);
    saveStore(store);

    // Sync to Supabase in background
    syncToSupabase('members', {
      name: newMember.name,
      mobile: newMember.mobile,
      photo_url: newMember.photoUrl || null,
      father_name: newMember.fatherName || null,
      dob: newMember.dob || null,
      address: newMember.address || null,
      status: newMember.status,
      role: 'MEMBER',
      system_role: 'MEMBER',
      organization_name: newMember.organizationName,
    }, 'insert').catch(() => {});

    logAuditAction(
      `Registered Member (${newMember.name}) [Role: MEMBER, Status: ${newMember.status}]`,
      adminName || 'Public Registration Portal',
      adminMobile || newMember.mobile,
      newMember.name
    );

    return NextResponse.json({ success: true, member: newMember }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'सदस्य पंजीकरण करने में त्रुटि हुई।' }, { status: 500 });
  }
}
