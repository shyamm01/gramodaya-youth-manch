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

    const index = (store.villages || []).findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Village not found' }, { status: 404 });
    }

    const updated = {
      ...store.villages[index],
      ...body,
      id,
    };

    store.villages[index] = updated;
    saveStore(store);

    logAuditAction(
      `Updated Village Unit: ${updated.nameHindi || updated.name}`,
      body.adminName || 'Admin',
      body.adminMobile || '',
      updated.name
    );

    return NextResponse.json({ success: true, village: updated, villages: store.villages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating village' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const store = loadStore();

    const village = (store.villages || []).find((v) => v.id === id);
    store.villages = (store.villages || []).filter((v) => v.id !== id);
    saveStore(store);

    if (village) {
      logAuditAction(
        `Deleted Village Unit: ${village.nameHindi || village.name}`,
        body.adminName || 'Super Admin',
        body.adminMobile || '',
        village.name
      );
    }

    return NextResponse.json({ success: true, villages: store.villages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting village' }, { status: 500 });
  }
}
