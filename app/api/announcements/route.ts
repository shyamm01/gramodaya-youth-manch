import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, announcements: store.announcements });
}

export async function POST(req: Request) {
  try {
    const { title, content, publishedBy, date, adminName, adminMobile } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'शीर्षक और सूचना विवरण आवश्यक है।' }, { status: 400 });
    }

    const store = loadStore();
    const newAnn = {
      id: `ann_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      content: content.trim(),
      publishedBy: (publishedBy || adminName || 'ग्रामोदय यूथ मंच').trim(),
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    store.announcements.unshift(newAnn);
    saveStore(store);

    logAuditAction(
      `Published Announcement (${newAnn.title})`,
      adminName || 'Admin',
      adminMobile || '',
      newAnn.title
    );

    return NextResponse.json({ success: true, announcement: newAnn });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error publishing announcement' }, { status: 500 });
  }
}
