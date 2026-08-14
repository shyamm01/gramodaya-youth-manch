import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, socialWorks: store.socialWorks });
}

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      date,
      location,
      submitterName,
      submitterMobile,
      photoUrl,
      videoUrl,
      status = 'pending',
      adminName,
      adminMobile,
    } = await req.json();

    if (!title || !description || !submitterName || !submitterMobile) {
      return NextResponse.json({ error: 'सभी आवश्यक जानकारी भरें।' }, { status: 400 });
    }

    const store = loadStore();
    const newWork = {
      id: `sw_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      description: description.trim(),
      date: date || new Date().toISOString().split('T')[0],
      location: location ? location.trim() : 'Rasoolpur',
      submitterName: submitterName.trim(),
      submitterMobile: submitterMobile.trim(),
      photoUrl: photoUrl || '',
      videoUrl: videoUrl || '',
      status: (status === 'approved' || status === 'published' ? status : 'pending') as 'pending' | 'approved' | 'published',
      createdAt: new Date().toISOString(),
    };

    store.socialWorks.unshift(newWork);
    saveStore(store);

    logAuditAction(
      `Submitted Social Work (${newWork.title}) [Status: ${newWork.status}]`,
      adminName || newWork.submitterName,
      adminMobile || newWork.submitterMobile,
      newWork.title
    );

    return NextResponse.json({ success: true, socialWork: newWork });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating social work' }, { status: 500 });
  }
}
