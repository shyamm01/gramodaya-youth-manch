import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const store = loadStore();

    const index = store.publicInfos.findIndex((i) => i.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Public info item not found' }, { status: 404 });
    }

    const updated = {
      ...store.publicInfos[index],
      ...body,
      id,
    };

    store.publicInfos[index] = updated;
    saveStore(store);

    logAuditAction(
      `Updated Public Info (${updated.name || updated.information.slice(0, 20)})`,
      body.updaterName || 'Member/Admin',
      body.updaterMobile || '',
      updated.name || 'Public Info'
    );

    return NextResponse.json({ success: true, publicInfo: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating public info' }, { status: 500 });
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
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile, userMobile } = body;

    const store = loadStore();
    const item = store.publicInfos.find((i) => i.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Public info item not found' }, { status: 404 });
    }

    store.publicInfos = store.publicInfos.filter((i) => i.id !== id);
    saveStore(store);

    logAuditAction(
      `Deleted Public Info (${item.name || item.information.slice(0, 20)})`,
      adminName || 'Member/Admin',
      adminMobile || userMobile || '',
      item.name || 'Public Info'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting item' }, { status: 500 });
  }
}
