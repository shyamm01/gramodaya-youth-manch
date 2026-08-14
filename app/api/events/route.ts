import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';
import { EventStatus } from '@/src/types';

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ success: true, events: store.events });
}

export async function POST(req: Request) {
  try {
    const {
      title,
      name,
      description,
      date,
      time,
      location,
      photoUrl,
      videoUrl,
      status = 'PUBLISHED',
      adminName,
      adminMobile,
    } = await req.json();

    const finalTitle = (title || name || '').trim();
    if (!finalTitle || !date || !location) {
      return NextResponse.json({ error: 'शीर्षक, दिनांक और स्थान आवश्यक हैं।' }, { status: 400 });
    }

    const store = loadStore();
    const newEvent = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: finalTitle,
      name: finalTitle,
      description: (description || '').trim(),
      date: date.trim(),
      time: (time || '10:00 AM').trim(),
      location: location.trim(),
      photoUrl: photoUrl || '',
      videoUrl: videoUrl || '',
      status: (status || 'PUBLISHED') as EventStatus,
      createdAt: new Date().toISOString(),
    };

    store.events.push(newEvent);
    saveStore(store);

    logAuditAction(
      `Created Event (${newEvent.title})`,
      adminName || 'Admin',
      adminMobile || '',
      newEvent.title
    );

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating event' }, { status: 500 });
  }
}
