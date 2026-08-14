import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, adminName, adminMobile } = await req.json();

    const store = loadStore();
    const item = store.socialWorks.find((w) => w.id === id);

    if (!item) {
      return NextResponse.json({ error: 'रिकॉर्ड नहीं मिला।' }, { status: 404 });
    }

    item.status = status;
    saveStore(store);

    logAuditAction(
      `Updated Social Work Status to "${status}" (${item.title})`,
      adminName || 'Admin',
      adminMobile || '',
      item.title
    );

    return NextResponse.json({ success: true, socialWork: item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
}
