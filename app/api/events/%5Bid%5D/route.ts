import { NextResponse } from 'next/server';
import { loadStore, saveStore, logAuditAction } from '@/src/lib/serverStore';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, title, name, description, date, time, location, photoUrl, videoUrl, adminName, adminMobile } = body;

    const store = loadStore();
    const event = store.events.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: 'कार्यक्रम नहीं मिला।' }, { status: 404 });
    }

    if (status !== undefined) event.status = status;
    if (title !== undefined || name !== undefined) {
      const t = title || name;
      event.title = t;
      event.name = t;
    }
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    if (photoUrl !== undefined) event.photoUrl = photoUrl;
    if (videoUrl !== undefined) event.videoUrl = videoUrl;

    saveStore(store);

    logAuditAction(
      `Updated Event (${event.title})`,
      adminName || 'Admin',
      adminMobile || '',
      event.title
    );

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating event' }, { status: 500 });
  }
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
    const event = store.events.find((e) => e.id === id);
    store.events = store.events.filter((e) => e.id !== id);
    saveStore(store);

    if (event) {
      logAuditAction(
        `Deleted Event (${event.title})`,
        adminName || 'Admin',
        adminMobile || '',
        event.title
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting event' }, { status: 500 });
  }
}
