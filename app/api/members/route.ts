import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

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
      status = 'pending',
      organizationName = 'ग्रामोदय यूथ मंच',
      adminName,
      adminMobile,
      createdAt,
    } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'नाम आवश्यक है।' }, { status: 400 });
    }

    const store = loadStore();
    const newMember = {
      id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      villageId: villageId || 'vil_rasoolpur',
      name: name.trim(),
      mobile: mobile ? mobile.trim() : 'Information not available',
      photoUrl: photoUrl || '',
      fatherName: fatherName ? fatherName.trim() : '',
      dob: dob || '',
      address: address ? address.trim() : '',
      status: (status === 'active' ? 'active' : 'pending') as 'active' | 'pending',
      role: 'MEMBER' as const, // User registers themselves -> Default role is "MEMBER"
      organizationName: organizationName || 'ग्रामोदय यूथ मंच',
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    };

    store.members.push(newMember);
    saveStore(store);

    logAuditAction(
      `Added Member (${newMember.name}) [Role: MEMBER, Status: ${newMember.status}]`,
      adminName || 'Public Portal',
      adminMobile || '',
      newMember.name
    );

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating member' }, { status: 500 });
  }
}
