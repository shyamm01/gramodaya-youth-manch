import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { supabase } from './supabase';

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yynnbfuinskyhdwjpnja.supabase.co';
const S3_ENDPOINT = process.env.SUPABASE_S3_ENDPOINT || 'https://yynnbfuinskyhdwjpnja.storage.supabase.co/storage/v1/s3';
const S3_ACCESS_KEY = process.env.SUPABASE_S3_ACCESS_KEY_ID || 'cbe3ac16d213f140d53c724f7b2c5145';
const S3_SECRET_KEY = process.env.SUPABASE_S3_SECRET_ACCESS_KEY || 'fde18ea545ef6f87041e7a035e082cd0d0b7b8bfb1190f2a8742d60c0699d3f4';
const S3_REGION = process.env.SUPABASE_S3_REGION || 'ap-southeast-2';
const DEFAULT_BUCKET = 'gramodaya-youth-munch';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  filename?: string;
  contentType?: string;
  upsert?: boolean;
  deduplicate?: boolean; // When true, uses SHA-256 hash to avoid duplicate storage
  oldUrlToDelete?: string | null; // Automatically deletes previous image upon success
}

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  path?: string;
  error?: string;
}

let s3ClientInstance: S3Client | null = null;

export function getSupabaseS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }
  return s3ClientInstance;
}

/**
 * Converts a base64 data URL to a Uint8Array buffer and mime type.
 */
export function parseBase64(base64: string): { buffer: Uint8Array; mimeType: string } {
  let mimeType = 'image/jpeg';
  let cleanData = base64;

  if (base64.startsWith('data:')) {
    const parts = base64.split(',');
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
    cleanData = parts[1];
  }

  const binaryString = atob(cleanData);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return { buffer: bytes, mimeType };
}

/**
 * Computes a short SHA-256 hash from a file buffer for content-based deduplication.
 */
export function computeBufferHash(buffer: Uint8Array): string {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 20);
}

/**
 * Returns the public CDN URL for an object stored in Supabase Storage.
 */
export function getSupabasePublicUrl(bucket: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Extracts the storage bucket and object key from a Supabase public CDN URL.
 */
export function parseSupabaseUrl(publicUrl: string): { bucket: string; key: string } | null {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  const marker = '/storage/v1/object/public/';
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;

  const afterMarker = publicUrl.substring(idx + marker.length);
  const slashIdx = afterMarker.indexOf('/');
  if (slashIdx === -1) return null;

  const bucket = afterMarker.substring(0, slashIdx);
  const key = afterMarker.substring(slashIdx + 1);
  return { bucket, key };
}

/**
 * Deletes an object from Supabase Storage given its public CDN URL.
 */
export async function deleteSupabaseObjectByUrl(publicUrl?: string | null): Promise<boolean> {
  if (!publicUrl || typeof publicUrl !== 'string') return false;
  const parsed = parseSupabaseUrl(publicUrl);
  if (!parsed) return false;

  try {
    const s3 = getSupabaseS3Client();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
      })
    );
    return true;
  } catch (s3Err) {
    try {
      const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.key]);
      return !error;
    } catch {
      return false;
    }
  }
}

/**
 * Ensures that an image input is stored in Supabase Storage and returns ONLY the public HTTP(S) URL.
 * Automatically cleans up the previous image if oldUrlToDelete is provided.
 */
export async function ensureSupabaseUrl(
  inputUrlOrBase64?: string | null,
  folder: string = 'uploads',
  prefix: string = 'img',
  oldUrlToDelete?: string | null
): Promise<string> {
  if (!inputUrlOrBase64 || typeof inputUrlOrBase64 !== 'string') return '';
  const trimmed = inputUrlOrBase64.trim();
  if (!trimmed) return '';

  // If already a remote CDN URL and no new base64 upload, return directly
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If base64, upload to Supabase Storage
  if (trimmed.startsWith('data:')) {
    try {
      const res = await uploadToSupabaseStorage(trimmed, {
        bucket: DEFAULT_BUCKET,
        folder,
        filename: `${prefix}_${Date.now()}.webp`,
        deduplicate: true,
        oldUrlToDelete,
      });
      if (res.success && res.publicUrl && !res.publicUrl.startsWith('data:')) {
        return res.publicUrl;
      }
    } catch (err) {
      console.warn('ensureSupabaseUrl upload error:', err);
    }
  }

  return '';
}

/**
 * Upload an image (File, Blob, or base64 string) to Supabase Storage with deduplication & auto-cleanup.
 */
export async function uploadToSupabaseStorage(
  fileOrBase64: File | Blob | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket = DEFAULT_BUCKET,
    folder = 'uploads',
    filename,
    contentType,
    deduplicate = false,
    oldUrlToDelete,
  } = options;

  try {
    if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://'))) {
      return { success: true, publicUrl: fileOrBase64 };
    }

    let fileBuffer: Uint8Array;
    let detectedType = contentType || 'image/webp';
    let ext = 'webp';

    if (typeof fileOrBase64 === 'string') {
      const parsed = parseBase64(fileOrBase64);
      fileBuffer = parsed.buffer;
      detectedType = contentType || parsed.mimeType;
      ext = detectedType.split('/')[1] || 'webp';
    } else {
      const arrayBuffer = await fileOrBase64.arrayBuffer();
      fileBuffer = new Uint8Array(arrayBuffer);
      if (fileOrBase64.type) {
        detectedType = contentType || fileOrBase64.type;
        ext = detectedType.split('/')[1] || 'webp';
      }
    }

    // Content-Based Hash Deduplication
    let safeName: string;
    if (deduplicate) {
      const hash = computeBufferHash(fileBuffer);
      safeName = `${hash}.${ext}`;
    } else if (filename) {
      safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    } else {
      safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    }

    const key = folder ? `${folder}/${safeName}` : safeName;

    // 1. Primary: Upload via Supabase S3 Protocol
    try {
      const s3 = getSupabaseS3Client();
      let targetBucket = bucket || DEFAULT_BUCKET;

      const command = new PutObjectCommand({
        Bucket: targetBucket,
        Key: key,
        Body: fileBuffer,
        ContentType: detectedType,
        CacheControl: 'public, max-age=31536000, immutable',
      });
      await s3.send(command);

      const publicUrl = getSupabasePublicUrl(targetBucket, key);

      // Auto-cleanup previous photo if different from new URL
      if (oldUrlToDelete && oldUrlToDelete !== publicUrl) {
        deleteSupabaseObjectByUrl(oldUrlToDelete).catch((err) =>
          console.warn('Auto-cleanup old photo note:', err)
        );
      }

      return {
        success: true,
        publicUrl,
        path: key,
      };
    } catch (s3Error: any) {
      console.warn('Supabase S3 upload note, attempting Supabase JS SDK fallback:', s3Error?.message);

      // 2. Fallback: Supabase Client SDK upload
      const { data, error } = await supabase.storage
        .from(DEFAULT_BUCKET)
        .upload(key, fileBuffer, {
          contentType: detectedType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);
        const publicUrl = urlData.publicUrl;

        if (oldUrlToDelete && oldUrlToDelete !== publicUrl) {
          deleteSupabaseObjectByUrl(oldUrlToDelete).catch(() => {});
        }

        return {
          success: true,
          publicUrl,
          path: data.path,
        };
      }

      return { success: false, error: error?.message || s3Error?.message || 'Upload failed' };
    }
  } catch (err: any) {
    console.error('Supabase storage upload error:', err);
    return { success: false, error: err?.message || 'Storage upload failed' };
  }
}

/**
 * Deletes an object by relative path and bucket.
 */
export async function deleteFromSupabaseStorage(
  filePath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<{ success: boolean; error?: string }> {
  try {
    const s3 = getSupabaseS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filePath,
    });
    await s3.send(command);
    return { success: true };
  } catch (s3Err) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Delete failed' };
    }
  }
}
