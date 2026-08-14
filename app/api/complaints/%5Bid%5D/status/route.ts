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
    const complaint = store.complaints.find((c) => c.id === id);

    if (!complaint) {
      return NextResponse.json({ error: 'शिकायत नहीं मिली।' }, { status: 404 });
    }

    complaint.status = status;
    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date().toISOString();
    }

    saveStore(store);

    logAuditAction(
      `Updated Complaint Status to "${status}" (${complaint.title})`,
      adminName || 'Admin',
      adminMobile || '',
      complaint.title
    );

    return NextResponse.json({ success: true, complaint });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating status' }, { status: 500 });
  }
}
