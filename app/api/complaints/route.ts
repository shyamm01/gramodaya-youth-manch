import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, complaints: store.complaints });
}

export async function POST(req: Request) {
  try {
    const {
      title,
      category,
      description,
      location,
      reporterName,
      reporterMobile,
      photoUrl,
      videoUrl,
      isDemo = false,
      adminName,
      adminMobile,
    } = await req.json();

    if (!title || !description || !reporterName || !reporterMobile) {
      return NextResponse.json({ error: 'सभी आवश्यक विवरण भरें।' }, { status: 400 });
    }

    const store = loadStore();
    const newComplaint = {
      id: `comp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      category: category || 'Other',
      description: description.trim(),
      location: location ? location.trim() : 'Rasoolpur',
      reporterName: reporterName.trim(),
      reporterMobile: reporterMobile.trim(),
      status: 'NEW' as const,
      photoUrl: photoUrl || '',
      videoUrl: videoUrl || '',
      isDemo: Boolean(isDemo),
      createdAt: new Date().toISOString(),
    };

    store.complaints.unshift(newComplaint);
    saveStore(store);

    logAuditAction(
      `Submitted Complaint (${newComplaint.title})`,
      adminName || newComplaint.reporterName,
      adminMobile || newComplaint.reporterMobile,
      newComplaint.title
    );

    return NextResponse.json({ success: true, complaint: newComplaint });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating complaint' }, { status: 500 });
  }
}
