import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, adminName, adminMobile } = body;

    const store = loadStore();
    const ann = store.announcements.find((a) => a.id === id);

    if (!ann) {
      return NextResponse.json({ error: 'घोषणा नहीं मिली।' }, { status: 404 });
    }

    if (title !== undefined) ann.title = title.trim();
    if (content !== undefined) ann.content = content.trim();

    saveStore(store);

    logAuditAction(
      `Updated Announcement (${ann.title})`,
      adminName || 'Admin',
      adminMobile || '',
      ann.title
    );

    return NextResponse.json({ success: true, announcement: ann });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating announcement' }, { status: 500 });
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
