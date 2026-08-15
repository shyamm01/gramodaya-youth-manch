'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Zap, Crop } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { ImageCropperModal } from './ImageCropperModal';
import { optimizeImage, forceReduceImageSize, formatFileSize, STRICT_UNDER_100KB_LIMIT, OptimizedImageResult } from '@/src/lib/imageOptimizer';

export interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
  folder?: string;
  label?: string;
  hint?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  enableCrop?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onRemove,
  bucket = 'images',
  folder = 'uploads',
  label,
  hint = 'PNG, JPG, WEBP (स्वतः 100KB से कम में कंप्रेस होकर अपलोड होगी)',
  aspectRatio = 'auto',
  maxSizeMB = 15,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75,
  enableCrop = true,
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [optStats, setOptStats] = useState<OptimizedImageResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Crop State
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [pendingCropSrc, setPendingCropSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square max-w-[200px] mx-auto',
    video: 'aspect-video w-full',
    banner: 'aspect-[21/9] w-full',
    auto: 'min-h-[140px] w-full',
  }[aspectRatio];

  const uploadOptimizedSource = useCallback(
    async (source: File | string, filenameHint: string = 'image.webp') => {
      setErrorMsg(null);
      setIsUploading(true);
      setUploadStatus('100KB से कम में कंप्रेस हो रही है...');

      try {
        // 1. Client-Side Image Optimization (Resize, WebP & Under 100KB Enforced)
        let fileToUpload: File;
        let optimizedDataUrl: string = '';

        const optResult = await optimizeImage(source, {
          maxWidth,
          maxHeight,
          quality,
          outputFormat: 'image/webp',
          maxSizeBytes: STRICT_UNDER_100KB_LIMIT,
        });

        setOptStats(optResult);
        fileToUpload = optResult.file;
        optimizedDataUrl = optResult.dataUrl;

        setUploadStatus('Supabase Storage में अपलोड हो रहा है...');

        // 2. Upload to Supabase Storage via Server API
        let uploadedUrl: string | null = null;
        let lastErrorMsg: string | null = null;

        const attemptUpload = async (fileObj: File, dataUri: string): Promise<string | null> => {
          if (dataUri) {
            try {
              const res = await fetch('/api/upload/supabase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  base64: dataUri,
                  bucket,
                  folder,
                  filename: `${Date.now()}_${filenameHint}`,
                }),
              });
              const data = await res.json();
              if (data.success && data.url) {
                return data.url;
              } else if (data.error) {
                lastErrorMsg = data.error;
              }
            } catch (apiErr: any) {
              lastErrorMsg = apiErr.message;
            }
          }

          if (fileObj) {
            try {
              const formData = new FormData();
              formData.append('file', fileObj);
              formData.append('bucket', bucket);
              formData.append('folder', folder);
              formData.append('filename', `${Date.now()}_${filenameHint}`);

              const res = await fetch('/api/upload/supabase', {
                method: 'POST',
                body: formData,
              });
              const data = await res.json();
              if (data.success && data.url) {
                return data.url;
              } else if (data.error) {
                lastErrorMsg = data.error;
              }
            } catch (formErr: any) {
              lastErrorMsg = formErr.message;
            }
          }

          return null;
        };

        uploadedUrl = await attemptUpload(fileToUpload, optimizedDataUrl);

        // 3. Auto-healing on storage quota size error
        if (!uploadedUrl && lastErrorMsg && (
          lastErrorMsg.toLowerCase().includes('exceeded the maximum allowed size') ||
          lastErrorMsg.toLowerCase().includes('entitytoolarge') ||
          lastErrorMsg.toLowerCase().includes('too large')
        )) {
          setUploadStatus('आकार सीमा से बड़ा है, स्वतः छोटा किया जा रहा है...');
          try {
            const aggressiveOpt = await forceReduceImageSize(source, 70 * 1024);
            setOptStats(aggressiveOpt);
            uploadedUrl = await attemptUpload(aggressiveOpt.file, aggressiveOpt.dataUrl);
          } catch (retryErr) {
            console.warn('Retry error:', retryErr);
          }
        }

        if (uploadedUrl) {
          onChange(uploadedUrl);
        } else if (optimizedDataUrl) {
          onChange(optimizedDataUrl);
        }
      } catch (err: any) {
        console.warn('Image upload fallback note:', err);
      } finally {
        setIsUploading(false);
        setUploadStatus('');
      }
    },
    [bucket, folder, maxHeight, maxWidth, onChange, quality]
  );

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('कृपया केवल इमेज (फोटो) फाइल चुनें। (Only image files allowed)');
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`फाइल का आकार ${maxSizeMB}MB से कम होना चाहिए। (File exceeds ${maxSizeMB}MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        if (enableCrop) {
          setPendingCropSrc(rawDataUrl);
          setIsCropperOpen(true);
        } else {
          uploadOptimizedSource(file, file.name.replace(/[^a-zA-Z0-9.-]/g, '_'));
        }
      };
      reader.readAsDataURL(file);
    },
    [enableCrop, maxSizeMB, uploadOptimizedSource]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    if (e.target) e.target.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOptStats(null);
    if (onRemove) onRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenRecrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      setPendingCropSrc(value);
      setIsCropperOpen(true);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={disabled || isUploading}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Dropzone Container */}
      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-4 text-center select-none ${aspectRatioClass} ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : value
            ? 'border-emerald-500/40 bg-slate-900/5 dark:bg-slate-950/40 hover:border-emerald-500'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 hover:border-emerald-500 hover:bg-emerald-500/5'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* State 1: Uploading & Optimizing Spinner */}
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 animate-fade-in p-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold">{uploadStatus || 'Processing...'}</p>
          </div>
        ) : value ? (
          /* State 2: Image Preview with Overlay Controls */
          <div className="relative w-full h-full min-h-[140px] flex items-center justify-center group">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full max-h-64 object-contain rounded-xl"
            />
            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5 backdrop-blur-2xs p-2 flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={handleOpenRecrop}
                className="rounded-xl text-[11px] font-bold"
              >
                <Crop className="w-3.5 h-3.5 mr-1" />
                क्रॉप (Crop)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="rounded-xl text-[11px] font-bold"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                बदलें
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="xs"
                onClick={handleRemove}
                className="rounded-xl text-[11px] font-bold"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                हटाएं
              </Button>
            </div>
            {/* Top Success & Under-100KB Badges */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              {optStats && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md">
                  <Zap className="w-3 h-3 text-amber-300" />
                  {formatFileSize(optStats.optimizedSize)}
                </span>
              )}
              <div className="bg-emerald-600 text-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ) : (
          /* State 3: Empty Dropzone State */
          <div className="flex flex-col items-center justify-center gap-2 p-3 text-slate-500 dark:text-slate-400">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                फ़ोटो यहाँ खींचें या क्लिक करें (Drag & Drop or Click)
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {hint}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Crop Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={pendingCropSrc}
        aspectRatio={aspectRatio === 'auto' ? 'square' : aspectRatio}
        onClose={() => {
          setIsCropperOpen(false);
          setPendingCropSrc(null);
        }}
        onCropComplete={(croppedDataUrl) => {
          uploadOptimizedSource(croppedDataUrl, 'cropped_image.webp');
        }}
      />
    </div>
  );
};
