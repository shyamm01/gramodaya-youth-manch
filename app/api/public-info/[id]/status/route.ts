import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { requireAuth } from '@/src/lib/jwtAuth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'public_info:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const { status, adminName, adminMobile } = await req.json();

    const store = loadStore();
    const info = store.publicInfos.find((i) => i.id === id);

    if (!info) {
      return NextResponse.json({ error: 'सूचना नहीं मिली।' }, { status: 404 });
    }

    info.status = status;
    saveStore(store);

    logAuditAction(
      `Updated Public Info Status to "${status}" (${info.name})`,
      adminName || currentUser.name || 'Admin',
      adminMobile || currentUser.mobile || '',
      info.name
    );

    return NextResponse.json({ success: true, publicInfo: info });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, 'public_info:manage');
    if (!auth.success) return auth.response;
    const currentUser = auth.user;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const store = loadStore();
    const item = store.publicInfos.find((i) => i.id === id);
    store.publicInfos = store.publicInfos.filter((i) => i.id !== id);
    saveStore(store);

    if (item) {
      logAuditAction(
        `Deleted Public Info (${item.name})`,
        adminName || currentUser.name || 'Admin',
        adminMobile || currentUser.mobile || '',
        item.name
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting info' }, { status: 500 });
  }
}
