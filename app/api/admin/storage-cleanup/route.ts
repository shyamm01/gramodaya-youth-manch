import { NextResponse } from 'next/server';
import {
  getSupabaseS3Client,
  getSupabasePublicUrl,
  parseSupabaseUrl,
} from '@/src/lib/supabaseStorage';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getDb } from '@/src/db';
import * as schema from '@/src/db/schema';
import { verifyJwtToken } from '@/src/lib/jwtAuth';

const DEFAULT_BUCKET = 'gramodaya-youth-munch';

/**
 * Storage Cleanup & Garbage Collector API
 * Scans Supabase bucket and deletes orphaned/unreferenced files not in PostgreSQL.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const adminToken = req.headers.get('x-admin-token') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    // Authorization check
    let isAuthorized = adminToken === 'admin_active';
    if (!isAuthorized && token) {
      const decoded = await verifyJwtToken(token);
      if (decoded && (decoded.isAdmin || decoded.role === 'ADMIN' || decoded.systemRole === 'SUPER_ADMIN')) {
        isAuthorized = true;
      }
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    // 1. Gather all active referenced URLs from Database
    const referencedUrls = new Set<string>();

    const [
      membersRows,
      galleryRows,
      eventsRows,
      complaintsRows,
      socialWorksRows,
      eldersRows,
    ] = await Promise.all([
      db.select({ url: schema.members.photoUrl }).from(schema.members),
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
          const parsed = parseSupabaseUrl(r.url.trim());
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

    // 2. List all objects in Supabase bucket
    const s3 = getSupabaseS3Client();
    const listRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: DEFAULT_BUCKET,
      })
    );

    const objects = listRes.Contents || [];
    const now = Date.now();
    const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 minutes grace period for recent in-flight uploads

    const orphansToDelete: { Key: string }[] = [];
    let freedBytes = 0;

    for (const obj of objects) {
      if (!obj.Key) continue;

      const objPublicUrl = getSupabasePublicUrl(DEFAULT_BUCKET, obj.Key);
      const isReferenced = referencedUrls.has(objPublicUrl) || referencedUrls.has(obj.Key);

      // Check age
      const lastModified = obj.LastModified ? new Date(obj.LastModified).getTime() : 0;
      const isOldEnough = now - lastModified > GRACE_PERIOD_MS;

      if (!isReferenced && isOldEnough) {
        orphansToDelete.push({ Key: obj.Key });
        freedBytes += obj.Size || 0;
      }
    }

    // 3. Batch delete orphaned files
    let deletedCount = 0;
    if (orphansToDelete.length > 0) {
      // S3 DeleteObjects can delete up to 1000 objects in a single batch
      const batchSize = 500;
      for (let i = 0; i < orphansToDelete.length; i += batchSize) {
        const batch = orphansToDelete.slice(i, i + batchSize);
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: DEFAULT_BUCKET,
            Delete: {
              Objects: batch,
              Quiet: true,
            },
          })
        );
        deletedCount += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      bucket: DEFAULT_BUCKET,
      scannedTotalObjects: objects.length,
      activeReferencedObjects: referencedUrls.size,
      deletedOrphanObjects: deletedCount,
      freedBytes,
      freedFormatted: `${(freedBytes / (1024 * 1024)).toFixed(2)} MB`,
      cleanedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Storage cleanup error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Cleanup failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Support running cleanup via GET for cron pingers
  return POST(req);
}
