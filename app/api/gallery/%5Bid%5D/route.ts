import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, caption, adminName, adminMobile } = await req.json();

    const store = loadStore();
    const item = store.gallery.find((g) => g.id === id);

    if (!item) {
      return NextResponse.json({ error: 'गैलरी आइटम नहीं मिला।' }, { status: 404 });
    }

    if (status !== undefined) item.status = status;
    if (caption !== undefined) item.caption = caption.trim();

    saveStore(store);

    logAuditAction(
      `Updated Gallery Item (${item.caption || id})`,
      adminName || 'Admin',
      adminMobile || '',
      item.caption || id
    );

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating item' }, { status: 500 });
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
    const item = store.gallery.find((g) => g.id === id);
    store.gallery = store.gallery.filter((g) => g.id !== id);
    saveStore(store);

    if (item) {
      logAuditAction(
        `Deleted Gallery Photo (${item.caption || id})`,
        adminName || 'Admin',
        adminMobile || '',
        item.caption || id
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting item' }, { status: 500 });
  }
}
