import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { supabase } from './supabase';

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yynnbfuinskyhdwjpnja.supabase.co';
const S3_ENDPOINT = process.env.SUPABASE_S3_ENDPOINT || 'https://yynnbfuinskyhdwjpnja.storage.supabase.co/storage/v1/s3';
const S3_ACCESS_KEY = process.env.SUPABASE_S3_ACCESS_KEY_ID || 'cbe3ac16d213f140d53c724f7b2c5145';
const S3_SECRET_KEY = process.env.SUPABASE_S3_SECRET_ACCESS_KEY || 'fde18ea545ef6f87041e7a035e082cd0d0b7b8bfb1190f2a8742d60c0699d3f4';
const S3_REGION = process.env.SUPABASE_S3_REGION || 'ap-southeast-2';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  filename?: string;
  contentType?: string;
  upsert?: boolean;
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
 * Returns the public CDN URL for an object stored in Supabase Storage.
 */
export function getSupabasePublicUrl(bucket: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Upload an image (File, Blob, or base64 string) to Supabase Storage via S3 or REST API.
 */
export async function uploadToSupabaseStorage(
  fileOrBase64: File | Blob | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket = 'images',
    folder = 'uploads',
    filename,
    contentType,
  } = options;

  try {
    // If it's already a hosted URL, return as is
    if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://'))) {
      return { success: true, publicUrl: fileOrBase64 };
    }

    let fileBuffer: Uint8Array;
    let detectedType = contentType || 'image/jpeg';
    let ext = 'jpg';

    if (typeof fileOrBase64 === 'string') {
      const parsed = parseBase64(fileOrBase64);
      fileBuffer = parsed.buffer;
      detectedType = contentType || parsed.mimeType;
      ext = detectedType.split('/')[1] || 'jpg';
    } else {
      const arrayBuffer = await fileOrBase64.arrayBuffer();
      fileBuffer = new Uint8Array(arrayBuffer);
      if (fileOrBase64.type) {
        detectedType = contentType || fileOrBase64.type;
        ext = detectedType.split('/')[1] || 'jpg';
      }
    }

    const safeName = filename
      ? filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      : `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const key = folder ? `${folder}/${safeName}` : safeName;

    // 1. Primary: Upload via Supabase S3 Protocol
    try {
      const s3 = getSupabaseS3Client();
      let targetBucket = bucket;

      try {
        const command = new PutObjectCommand({
          Bucket: targetBucket,
          Key: key,
          Body: fileBuffer,
          ContentType: detectedType,
          CacheControl: 'max-age=3600',
        });
        await s3.send(command);
        return {
          success: true,
          publicUrl: getSupabasePublicUrl(targetBucket, key),
          path: key,
        };
      } catch (err: any) {
        // Fallback to confirmed Supabase project bucket
        if (targetBucket !== 'gramodaya-youth-munch') {
          targetBucket = 'gramodaya-youth-munch';
          const command = new PutObjectCommand({
            Bucket: targetBucket,
            Key: key,
            Body: fileBuffer,
            ContentType: detectedType,
            CacheControl: 'max-age=3600',
          });
          await s3.send(command);
          return {
            success: true,
            publicUrl: getSupabasePublicUrl(targetBucket, key),
            path: key,
          };
        }
        throw err;
      }
    } catch (s3Error: any) {
      console.warn('Supabase S3 upload note, attempting Supabase JS SDK fallback:', s3Error?.message);

      // 2. Fallback: Supabase Client SDK upload
      const { data, error } = await supabase.storage
        .from('gramodaya-youth-munch')
        .upload(key, fileBuffer, {
          contentType: detectedType,
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('gramodaya-youth-munch').getPublicUrl(data.path);
        return {
          success: true,
          publicUrl: urlData.publicUrl,
          path: data.path,
        };
      }

      if (typeof fileOrBase64 === 'string') {
        return { success: true, publicUrl: fileOrBase64, path: key };
      }

      return { success: false, error: error?.message || s3Error?.message || 'Upload failed' };
    }
  } catch (err: any) {
    console.error('Supabase storage upload error:', err);
    if (typeof fileOrBase64 === 'string') {
      return { success: true, publicUrl: fileOrBase64 };
    }
    return { success: false, error: err?.message || 'Storage upload failed' };
  }
}

/**
 * Delete an object from Supabase Storage.
 */
export async function deleteFromSupabaseStorage(
  filePath: string,
  bucket: string = 'images'
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
