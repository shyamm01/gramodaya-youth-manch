export interface StorageFileMeta {
  buffer: Uint8Array;
  contentType: string;
  extension: string;
  sizeBytes: number;
}

export interface StorageUploadOptions {
  bucket?: string;
  folder?: string;
  filename?: string;
  contentType?: string;
  deduplicate?: boolean;
  oldUrlToDelete?: string | null;
}

export interface StorageUploadResult {
  success: boolean;
  publicUrl?: string;
  path?: string;
  error?: string;
}

export interface StorageCleanupResult {
  success: boolean;
  bucket: string;
  scannedTotalObjects: number;
  activeReferencedObjects: number;
  deletedOrphanObjects: number;
  freedBytes: number;
  freedFormatted: string;
  cleanedAt: string;
  error?: string;
}

/**
 * Interface Segregation: Specific contracts for storage capabilities
 */
export interface IStorageUploader {
  upload(
    source: File | Blob | string | Uint8Array,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult>;
}

export interface IStorageDeleter {
  deleteByUrl(publicUrl?: string | null): Promise<boolean>;
  deleteByPath(path: string, bucket?: string): Promise<boolean>;
}

export interface IStorageGarbageCollector {
  cleanOrphans(
    referencedUrls: Set<string>,
    gracePeriodMs?: number
  ): Promise<StorageCleanupResult>;
}

export interface IStorageService extends IStorageUploader, IStorageDeleter, IStorageGarbageCollector {
  getPublicUrl(path: string, bucket?: string): string;
  parseUrl(publicUrl: string): { bucket: string; key: string } | null;
}
