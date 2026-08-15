import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { supabase } from '../supabase';
import {
  IStorageService,
  StorageFileMeta,
  StorageUploadOptions,
  StorageUploadResult,
  StorageCleanupResult,
} from './types';

export class SupabaseStorageService implements IStorageService {
  private readonly defaultBucket: string;
  private readonly projectUrl: string;
  private s3Client: S3Client | null = null;

  constructor() {
    this.defaultBucket = process.env.SUPABASE_STORAGE_BUCKET || 'gramodaya-youth-munch';
    this.projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yynnbfuinskyhdwjpnja.supabase.co';
  }

  private getS3Client(): S3Client {
    if (!this.s3Client) {
      const endpoint = process.env.SUPABASE_S3_ENDPOINT || 'https://yynnbfuinskyhdwjpnja.storage.supabase.co/storage/v1/s3';
      const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID || 'cbe3ac16d213f140d53c724f7b2c5145';
      const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY || 'fde18ea545ef6f87041e7a035e082cd0d0b7b8bfb1190f2a8742d60c0699d3f4';
      const region = process.env.SUPABASE_S3_REGION || 'ap-southeast-2';

      this.s3Client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      });
    }
    return this.s3Client;
  }

  public getPublicUrl(path: string, bucket: string = this.defaultBucket): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.projectUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  public parseUrl(publicUrl: string): { bucket: string; key: string } | null {
    if (!publicUrl || typeof publicUrl !== 'string') return null;
    const marker = '/storage/v1/object/public/';
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;

    const afterMarker = publicUrl.substring(idx + marker.length);
    const slashIdx = afterMarker.indexOf('/');
    if (slashIdx === -1) return null;

    return {
      bucket: afterMarker.substring(0, slashIdx),
      key: afterMarker.substring(slashIdx + 1),
    };
  }

  private async normalizeToBuffer(
    source: File | Blob | string | Uint8Array,
    contentType?: string
  ): Promise<StorageFileMeta> {
    if (source instanceof Uint8Array) {
      const type = contentType || 'image/webp';
      return {
        buffer: source,
        contentType: type,
        extension: type.split('/')[1] || 'webp',
        sizeBytes: source.length,
      };
    }

    if (typeof source === 'string') {
      let mimeType = contentType || 'image/jpeg';
      let cleanData = source;

      if (source.startsWith('data:')) {
        const parts = source.split(',');
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
        cleanData = parts[1];
      }

      const binaryString = atob(cleanData);
      const len = binaryString.length;
      const buffer = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }

      return {
        buffer,
        contentType: mimeType,
        extension: mimeType.split('/')[1] || 'webp',
        sizeBytes: buffer.length,
      };
    }

    const arrayBuffer = await source.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const mimeType = contentType || source.type || 'image/webp';

    return {
      buffer,
      contentType: mimeType,
      extension: mimeType.split('/')[1] || 'webp',
      sizeBytes: buffer.length,
    };
  }

  private hashBuffer(buffer: Uint8Array): string {
    return createHash('sha256').update(buffer).digest('hex').slice(0, 20);
  }

  public async upload(
    source: File | Blob | string | Uint8Array,
    options: StorageUploadOptions = {}
  ): Promise<StorageUploadResult> {
    const {
      bucket = this.defaultBucket,
      folder = 'uploads',
      filename,
      contentType,
      deduplicate = false,
      oldUrlToDelete,
    } = options;

    try {
      if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
        return { success: true, publicUrl: source };
      }

      const meta = await this.normalizeToBuffer(source, contentType);

      let safeName: string;
      if (deduplicate) {
        const hash = this.hashBuffer(meta.buffer);
        safeName = `${hash}.${meta.extension}`;
      } else if (filename) {
        safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      } else {
        safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${meta.extension}`;
      }

      const key = folder ? `${folder}/${safeName}` : safeName;

      // 1. Upload via S3 Protocol
      try {
        const s3 = this.getS3Client();
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: meta.buffer,
            ContentType: meta.contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );

        const publicUrl = this.getPublicUrl(key, bucket);

        if (oldUrlToDelete && oldUrlToDelete !== publicUrl) {
          this.deleteByUrl(oldUrlToDelete).catch(() => {});
        }

        return { success: true, publicUrl, path: key };
      } catch (s3Error: any) {
        // 2. Fallback to Supabase Client SDK
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(key, meta.buffer, {
            contentType: meta.contentType,
            cacheControl: '31536000',
            upsert: true,
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
          const publicUrl = urlData.publicUrl;

          if (oldUrlToDelete && oldUrlToDelete !== publicUrl) {
            this.deleteByUrl(oldUrlToDelete).catch(() => {});
          }

          return { success: true, publicUrl, path: data.path };
        }

        return { success: false, error: error?.message || s3Error?.message || 'Upload failed' };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Storage upload failed' };
    }
  }

  public async deleteByUrl(publicUrl?: string | null): Promise<boolean> {
    if (!publicUrl || typeof publicUrl !== 'string') return false;
    const parsed = this.parseUrl(publicUrl);
    if (!parsed) return false;
    return this.deleteByPath(parsed.key, parsed.bucket);
  }

  public async deleteByPath(path: string, bucket: string = this.defaultBucket): Promise<boolean> {
    try {
      const s3 = this.getS3Client();
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: path }));
      return true;
    } catch {
      try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        return !error;
      } catch {
        return false;
      }
    }
  }

  public async cleanOrphans(
    referencedUrls: Set<string>,
    gracePeriodMs: number = 30 * 60 * 1000
  ): Promise<StorageCleanupResult> {
    const s3 = this.getS3Client();
    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: this.defaultBucket }));
    const objects = listRes.Contents || [];
    const now = Date.now();

    const orphansToDelete: { Key: string }[] = [];
    let freedBytes = 0;

    for (const obj of objects) {
      if (!obj.Key) continue;
      const objPublicUrl = this.getPublicUrl(obj.Key, this.defaultBucket);
      const isReferenced = referencedUrls.has(objPublicUrl) || referencedUrls.has(obj.Key);
      const lastModified = obj.LastModified ? new Date(obj.LastModified).getTime() : 0;

      if (!isReferenced && now - lastModified > gracePeriodMs) {
        orphansToDelete.push({ Key: obj.Key });
        freedBytes += obj.Size || 0;
      }
    }

    let deletedCount = 0;
    if (orphansToDelete.length > 0) {
      const batchSize = 500;
      for (let i = 0; i < orphansToDelete.length; i += batchSize) {
        const batch = orphansToDelete.slice(i, i + batchSize);
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: this.defaultBucket,
            Delete: { Objects: batch, Quiet: true },
          })
        );
        deletedCount += batch.length;
      }
    }

    return {
      success: true,
      bucket: this.defaultBucket,
      scannedTotalObjects: objects.length,
      activeReferencedObjects: referencedUrls.size,
      deletedOrphanObjects: deletedCount,
      freedBytes,
      freedFormatted: `${(freedBytes / (1024 * 1024)).toFixed(2)} MB`,
      cleanedAt: new Date().toISOString(),
    };
  }
}
