import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { adminName, adminMobile } = body;

    const store = loadStore();
    const ann = store.announcements.find((a) => a.id === id);
    store.announcements = store.announcements.filter((a) => a.id !== id);
    saveStore(store);

    if (ann) {
      logAuditAction(
        `Deleted Announcement (${ann.title})`,
        adminName || 'Admin',
        adminMobile || '',
        ann.title
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting announcement' }, { status: 500 });
  }
}
