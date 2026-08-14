import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, elders: store.elders });
}

export async function POST(req: Request) {
  try {
    const { name, mobile, location, details, photoUrl, adminName, adminMobile } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'बुजुर्ग का नाम आवश्यक है।' }, { status: 400 });
    }

    const store = loadStore();
    const newElder = {
      id: `eld_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      mobile: mobile ? mobile.trim() : '',
      location: location ? location.trim() : 'Rasoolpur',
      details: (details || '').trim(),
      photoUrl: photoUrl || '',
      createdAt: new Date().toISOString(),
    };

    store.elders.push(newElder);
    saveStore(store);

    logAuditAction(
      `Added Elder (${newElder.name})`,
      adminName || 'Admin',
      adminMobile || '',
      newElder.name
    );

    return NextResponse.json({ success: true, elder: newElder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error adding elder' }, { status: 500 });
  }
}
