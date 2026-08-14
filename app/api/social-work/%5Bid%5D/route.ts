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

    const index = store.socialWorks.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Social work item not found' }, { status: 404 });
    }

    const updated = {
      ...store.socialWorks[index],
      ...body,
      id,
    };

    store.socialWorks[index] = updated;
    saveStore(store);

    logAuditAction(
      `Updated Social Work (${updated.title})`,
      body.updaterName || 'Member/Admin',
      body.updaterMobile || '',
      updated.title
    );

    return NextResponse.json({ success: true, socialWork: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating social work' }, { status: 500 });
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
    const item = store.socialWorks.find((w) => w.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Social work item not found' }, { status: 404 });
    }

    store.socialWorks = store.socialWorks.filter((w) => w.id !== id);
    saveStore(store);

    logAuditAction(
      `Deleted Social Work (${item.title})`,
      adminName || 'Member/Admin',
      adminMobile || userMobile || '',
      item.title
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting item' }, { status: 500 });
  }
}
