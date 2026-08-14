import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction, normalizeMobile } from '@/src/lib/serverStore';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const store = loadStore();

    const index = store.complaints.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updated = {
      ...store.complaints[index],
      ...body,
      id,
    };

    store.complaints[index] = updated;
    saveStore(store);

    logAuditAction(
      `Updated Complaint (${updated.title})`,
      body.updaterName || 'User',
      body.updaterMobile || '',
      updated.title
    );

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating complaint' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile, userMobile } = body;

    const store = loadStore();
    const item = store.complaints.find((c) => c.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    store.complaints = store.complaints.filter((c) => c.id !== id);
    saveStore(store);

    logAuditAction(
      `Deleted Complaint (${item.title})`,
      adminName || 'Member/Admin',
      adminMobile || userMobile || '',
      item.title
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting complaint' }, { status: 500 });
  }
}
