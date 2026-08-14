import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, gallery: store.gallery });
}

export async function POST(req: Request) {
  try {
    const {
      caption,
      photoUrl,
      uploadedBy,
      date,
      status = 'published',
      adminName,
      adminMobile,
    } = await req.json();

    if (!photoUrl) {
      return NextResponse.json({ error: 'तस्वीर का लिंक/डेटा आवश्यक है।' }, { status: 400 });
    }

    const store = loadStore();
    const newItem = {
      id: `gal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      caption: (caption || '').trim(),
      photoUrl: photoUrl.trim(),
      uploadedBy: (uploadedBy || 'Admin').trim(),
      date: date || new Date().toISOString().split('T')[0],
      status: (status === 'pending' ? 'pending' : 'published') as 'pending' | 'published',
      createdAt: new Date().toISOString(),
    };

    store.gallery.unshift(newItem);
    saveStore(store);

    logAuditAction(
      `Added Gallery Photo (${newItem.caption || 'Photo'})`,
      adminName || newItem.uploadedBy,
      adminMobile || '',
      newItem.caption || 'Photo'
    );

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error adding photo' }, { status: 500 });
  }
}
