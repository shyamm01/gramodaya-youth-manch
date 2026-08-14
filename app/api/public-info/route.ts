import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, publicInfos: store.publicInfos });
}

export async function POST(req: Request) {
  try {
    const { name, mobile, information, photoUrl, status = 'pending', adminName, adminMobile } = await req.json();

    if (!name || !mobile || !information) {
      return NextResponse.json({ error: 'सभी आवश्यक जानकारी भरें।' }, { status: 400 });
    }

    const store = loadStore();
    const newInfo = {
      id: `info_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      mobile: mobile.trim(),
      information: information.trim(),
      photoUrl: photoUrl || '',
      status: (status === 'approved' || status === 'rejected' ? status : 'pending') as 'pending' | 'approved' | 'rejected',
      createdAt: new Date().toISOString(),
    };

    store.publicInfos.unshift(newInfo);
    saveStore(store);

    logAuditAction(
      `Submitted Public Info (${newInfo.name}) [Status: ${newInfo.status}]`,
      adminName || newInfo.name,
      adminMobile || newInfo.mobile,
      newInfo.information.substring(0, 30)
    );

    return NextResponse.json({ success: true, publicInfo: newInfo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error submitting information' }, { status: 500 });
  }
}
