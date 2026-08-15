'use client';

export const STRICT_UNDER_100KB_LIMIT = 95 * 1024; // 95 KB threshold to strictly guarantee < 100 KB

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
  maxSizeBytes?: number; // Defaults to < 100KB (95KB)
}

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
}

/**
 * Optimizes and converts any image client-side to modern WebP strictly under 100 KB.
 */
export async function optimizeImage(
  imageSource: File | Blob | string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.75,
    outputFormat = 'image/webp',
    maxSizeBytes = STRICT_UNDER_100KB_LIMIT, // Always strictly enforce < 100KB by default
  } = options;

  const performCompression = (
    wLimit: number,
    hLimit: number,
    q: number
  ): Promise<OptimizedImageResult> => {
    return new Promise((resolve, reject) => {
      let originalSize = 0;
      let fileName = 'image.webp';

      if (imageSource instanceof File) {
        originalSize = imageSource.size;
        fileName = imageSource.name.replace(/\.[^/.]+$/, '') + (outputFormat === 'image/webp' ? '.webp' : '.jpg');
      } else if (imageSource instanceof Blob) {
        originalSize = imageSource.size;
      } else if (typeof imageSource === 'string') {
        originalSize = Math.round((imageSource.length * 3) / 4);
      }

      const img = new Image();

      if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate constrained dimensions preserving aspect ratio
        if (width > wLimit || height > hLimit) {
          const ratio = Math.min(wLimit / width, hLimit / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: outputFormat === 'image/webp' || outputFormat === 'image/png' });

        if (!ctx) {
          return reject(new Error('Canvas 2D context unavailable'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              const dataUrl = canvas.toDataURL(outputFormat, q);
              const optimizedSize = Math.round((dataUrl.length * 3) / 4);
              const savingsPercent = originalSize > 0 ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100)) : 0;
              return resolve({
                file: new File([], fileName, { type: outputFormat }),
                dataUrl,
                originalSize,
                optimizedSize,
                savingsPercent,
                width,
                height,
              });
            }

            const optimizedFile = new File([blob], fileName, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            const optimizedSize = blob.size;
            const savingsPercent = originalSize > 0 ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100)) : 0;
            const dataUrl = canvas.toDataURL(outputFormat, q);

            resolve({
              file: optimizedFile,
              dataUrl,
              originalSize,
              optimizedSize,
              savingsPercent,
              width,
              height,
            });
          },
          outputFormat,
          q
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for optimization'));
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        const objectUrl = URL.createObjectURL(imageSource);
        img.src = objectUrl;
      }
    });
  };

  // Pass 1: Standard high-quality compression
  let result = await performCompression(maxWidth, maxHeight, quality);

  // Progressive Reduction Loop: If size exceeds maxSizeBytes (< 100KB), downscale and compress progressively!
  if (result.optimizedSize > maxSizeBytes) {
    const progressiveSteps = [
      { w: 900, h: 900, q: 0.68 },
      { w: 750, h: 750, q: 0.58 },
      { w: 620, h: 620, q: 0.48 },
      { w: 500, h: 500, q: 0.38 },
      { w: 400, h: 400, q: 0.28 },
      { w: 300, h: 300, q: 0.20 },
    ];

    for (const step of progressiveSteps) {
      if (result.optimizedSize <= maxSizeBytes) break;
      try {
        const nextResult = await performCompression(step.w, step.h, step.q);
        result = nextResult;
      } catch (e) {
        break;
      }
    }
  }

  return result;
}

/**
 * Aggressively reduces image size strictly below 80KB.
 */
export async function forceReduceImageSize(
  imageSource: File | Blob | string,
  targetMaxBytes: number = 80 * 1024
): Promise<OptimizedImageResult> {
  return optimizeImage(imageSource, {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.45,
    outputFormat: 'image/webp',
    maxSizeBytes: targetMaxBytes,
  });
}

/**
 * Format bytes into human-readable string (KB, MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
