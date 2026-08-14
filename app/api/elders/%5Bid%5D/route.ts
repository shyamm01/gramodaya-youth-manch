import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, mobile, location, details, photoUrl, adminName, adminMobile } = body;

    const store = loadStore();
    const elder = store.elders.find((e) => e.id === id);

    if (!elder) {
      return NextResponse.json({ error: 'बुजुर्ग का रिकॉर्ड नहीं मिला।' }, { status: 404 });
    }

    if (name !== undefined) elder.name = name.trim();
    if (mobile !== undefined) elder.mobile = mobile.trim();
    if (location !== undefined) elder.location = location.trim();
    if (details !== undefined) elder.details = details.trim();
    if (photoUrl !== undefined) elder.photoUrl = photoUrl;

    saveStore(store);

    logAuditAction(
      `Updated Elder (${elder.name})`,
      adminName || 'Admin',
      adminMobile || '',
      elder.name
    );

    return NextResponse.json({ success: true, elder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating elder' }, { status: 500 });
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
    const elder = store.elders.find((e) => e.id === id);
    store.elders = store.elders.filter((e) => e.id !== id);
    saveStore(store);

    if (elder) {
      logAuditAction(
        `Deleted Elder (${elder.name})`,
        adminName || 'Admin',
        adminMobile || '',
        elder.name
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting elder' }, { status: 500 });
  }
}
