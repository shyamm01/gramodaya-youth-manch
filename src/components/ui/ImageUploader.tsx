'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { uploadToSupabaseStorage } from '@/src/lib/supabaseStorage';

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
  hint = 'PNG, JPG, WEBP up to 5MB (Drag & Drop or Click)',
  aspectRatio = 'auto',
  maxSizeMB = 5,
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square max-w-[200px] mx-auto',
    video: 'aspect-video w-full',
    banner: 'aspect-[21/9] w-full',
    auto: 'min-h-[140px] w-full',
  }[aspectRatio];

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

      setErrorMsg(null);
      setIsUploading(true);

      try {
        // Upload directly to Supabase Storage
        const uploadRes = await uploadToSupabaseStorage(file, {
          bucket,
          folder,
          filename: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          contentType: file.type,
        });

        if (uploadRes.success && uploadRes.publicUrl) {
          onChange(uploadRes.publicUrl);
        } else {
          // Fallback: Read as base64 data URL
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            onChange(base64);
          };
          reader.readAsDataURL(file);
        }
      } catch (err: any) {
        console.warn('Image upload fallback note:', err);
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          onChange(base64);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, folder, maxSizeMB, onChange]
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
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (onRemove) onRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        {/* State 1: Uploading Spinner */}
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 animate-fade-in p-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold">Uploading to Supabase Storage...</p>
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
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 backdrop-blur-2xs">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="rounded-xl text-xs font-bold"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                बदलें (Change)
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="xs"
                onClick={handleRemove}
                className="rounded-xl text-xs font-bold"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                हटाएं (Remove)
              </Button>
            </div>
            {/* Top Success Badge */}
            <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
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
    </div>
  );
};
