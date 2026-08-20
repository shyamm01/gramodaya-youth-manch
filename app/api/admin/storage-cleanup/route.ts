import { NextResponse } from 'next/server';
import { storageService } from '@/src/lib/storage';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { requireAuth } from '@/src/lib/jwtAuth';

/**
 * Storage Cleanup & Garbage Collector API (SOLID / Dependency Inversion)
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, undefined, 'ADMIN');
    if (!auth.success) return auth.response;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    // 1. Gather all active referenced URLs from PostgreSQL
    const referencedUrls = new Set<string>();

    const [
      membersRows,
      galleryRows,
      eventsRows,
      complaintsRows,
      socialWorksRows,
      eldersRows,
    ] = await Promise.all([
      db.select({ url: schema.profiles.avatarUrl }).from(schema.profiles),
      db.select({ url: schema.gallery.photoUrl }).from(schema.gallery),
      db.select({ url: schema.events.photoUrl }).from(schema.events),
      db.select({ url: schema.complaints.photoUrl }).from(schema.complaints),
      db.select({ url: schema.socialWorks.photoUrl }).from(schema.socialWorks),
      db.select({ url: schema.elders.photoUrl }).from(schema.elders),
    ]);

    const addValidUrls = (rows: { url?: string | null }[]) => {
      rows.forEach((r) => {
        if (r.url && typeof r.url === 'string' && r.url.startsWith('http')) {
          referencedUrls.add(r.url.trim());
          const parsed = storageService.parseUrl(r.url.trim());
          if (parsed?.key) referencedUrls.add(parsed.key);
        }
      });
    };

    addValidUrls(membersRows);
    addValidUrls(galleryRows);
    addValidUrls(eventsRows);
    addValidUrls(complaintsRows);
    addValidUrls(socialWorksRows);
    addValidUrls(eldersRows);

    // 2. Delegate garbage collection to StorageService (ISP & DIP)
    const cleanupResult = await storageService.cleanOrphans(referencedUrls, 30 * 60 * 1000);

    return NextResponse.json(cleanupResult);
  } catch (err: any) {
    console.error('Storage cleanup error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Cleanup failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
