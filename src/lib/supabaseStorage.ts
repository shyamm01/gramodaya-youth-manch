import { storageService, StorageUploadOptions, StorageUploadResult } from './storage';

export { storageService } from './storage';
export type UploadOptions = StorageUploadOptions;
export type UploadResult = StorageUploadResult;

export function getSupabasePublicUrl(bucket: string, path: string): string {
  return storageService.getPublicUrl(path, bucket);
}

export function parseSupabaseUrl(publicUrl: string): { bucket: string; key: string } | null {
  return storageService.parseUrl(publicUrl);
}

export async function deleteSupabaseObjectByUrl(publicUrl?: string | null): Promise<boolean> {
  return storageService.deleteByUrl(publicUrl);
}

export async function deleteFromSupabaseStorage(
  filePath: string,
  bucket?: string
): Promise<{ success: boolean; error?: string }> {
  const ok = await storageService.deleteByPath(filePath, bucket);
  return ok ? { success: true } : { success: false, error: 'Delete failed' };
}

/**
 * Upload an image (File, Blob, or base64 string) to Supabase Storage.
 * Delegated to StorageService (SOLID / Dependency Inversion).
 */
export async function uploadToSupabaseStorage(
  fileOrBase64: File | Blob | string,
  options: StorageUploadOptions = {}
): Promise<StorageUploadResult> {
  return storageService.upload(fileOrBase64, options);
}

/**
 * Ensures that an image input is stored in Supabase Storage and returns ONLY the public HTTP(S) URL.
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

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('data:')) {
    try {
      const res = await storageService.upload(trimmed, {
        folder,
        filename: `${prefix}_${Date.now()}.webp`,
        deduplicate: true,
        oldUrlToDelete,
      });
      if (res.success && res.publicUrl && !res.publicUrl.startsWith('data:')) {
        return res.publicUrl;
      }
    } catch (err) {
      console.warn('ensureSupabaseUrl error:', err);
    }
  }

  return '';
}
