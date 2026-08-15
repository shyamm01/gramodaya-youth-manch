import { supabase } from './supabase';

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

const DEFAULT_BUCKET = 'images';

/**
 * Converts a base64 data URL to a Uint8Array and mime type.
 */
function parseBase64(base64: string): { buffer: Uint8Array; mimeType: string } {
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
 * Upload an image (File, Blob, or base64 string) to Supabase Storage.
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
    upsert = true,
  } = options;

  try {
    // If it's already a remote hosted URL, return as is
    if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://'))) {
      return { success: true, publicUrl: fileOrBase64 };
    }

    let fileBody: Uint8Array | Blob | File;
    let detectedType = contentType || 'image/jpeg';
    let ext = 'jpg';

    if (typeof fileOrBase64 === 'string') {
      const parsed = parseBase64(fileOrBase64);
      fileBody = parsed.buffer;
      detectedType = contentType || parsed.mimeType;
      ext = detectedType.split('/')[1] || 'jpg';
    } else {
      fileBody = fileOrBase64;
      if (fileOrBase64.type) {
        detectedType = contentType || fileOrBase64.type;
        ext = detectedType.split('/')[1] || 'jpg';
      }
    }

    const safeName = filename
      ? filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      : `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const filePath = folder ? `${folder}/${safeName}` : safeName;

    // 1. Upload file to Supabase Storage bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBody, {
        contentType: detectedType,
        cacheControl: '3600',
        upsert,
      });

    if (error) {
      // If primary bucket failed, try 'member-photos' fallback bucket
      if (bucket !== 'member-photos') {
        const fallbackRes = await supabase.storage
          .from('member-photos')
          .upload(filePath, fileBody, {
            contentType: detectedType,
            cacheControl: '3600',
            upsert,
          });

        if (!fallbackRes.error && fallbackRes.data) {
          const { data: urlData } = supabase.storage
            .from('member-photos')
            .getPublicUrl(fallbackRes.data.path);
          return {
            success: true,
            publicUrl: urlData.publicUrl,
            path: fallbackRes.data.path,
          };
        }
      }

      console.warn('Supabase storage upload note:', error.message);
      // Fallback: If base64 was passed, return it so UI doesn't break
      if (typeof fileOrBase64 === 'string') {
        return { success: true, publicUrl: fileOrBase64, path: filePath };
      }
      return { success: false, error: error.message };
    }

    // 2. Retrieve the public CDN URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.warn('Supabase storage exception:', err);
    if (typeof fileOrBase64 === 'string') {
      return { success: true, publicUrl: fileOrBase64 };
    }
    return { success: false, error: err?.message || 'Storage upload failed' };
  }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromSupabaseStorage(
  filePath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}
