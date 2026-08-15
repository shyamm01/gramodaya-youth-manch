'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  FlipHorizontal,
  Square,
  RectangleHorizontal,
  Move,
  Loader2,
} from 'lucide-react';
import { Button } from './button';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspectRatio?: 'square' | 'video' | 'banner' | 'portrait' | 'free';
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

type AspectRatioOption = '1:1' | '16:9' | '4:3' | '3:4' | 'free';

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatio = 'square',
  onClose,
  onCropComplete,
}) => {
  const initialRatio: AspectRatioOption =
    aspectRatio === 'square'
      ? '1:1'
      : aspectRatio === 'video'
      ? '16:9'
      : aspectRatio === 'portrait'
      ? '3:4'
      : 'free';

  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>(initialRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 800, height: 800 });
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 300, height: 300 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Load natural dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      setNaturalSize({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 800,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Update container dimensions on ratio change or mount
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    }
  }, [isOpen, selectedRatio]);

  // Reset controls when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsFlipped(false);
      setPosition({ x: 0, y: 0 });
      setSelectedRatio(initialRatio);
      setIsProcessing(false);
    }
  }, [isOpen, initialRatio]);

  // Handle Drag / Pan with mouse or touch
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Perform Final Canvas Crop - 100% WYSIWYG
  const handleApplyCrop = useCallback(async () => {
    if (!imageSrc) return;

    try {
      setIsProcessing(true);

      const image = new Image();
      if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
        image.crossOrigin = 'anonymous';
      }

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = (err) => reject(new Error('Failed to load image into canvas: ' + String(err)));
        image.src = imageSrc;
      });

      const natW = image.naturalWidth || naturalSize.width || 800;
      const natH = image.naturalHeight || naturalSize.height || 800;

      // Target canvas dimensions
      let targetWidth = 800;
      let targetHeight = 800;

      if (selectedRatio === '16:9') {
        targetWidth = 960;
        targetHeight = 540;
      } else if (selectedRatio === '4:3') {
        targetWidth = 800;
        targetHeight = 600;
      } else if (selectedRatio === '3:4') {
        targetWidth = 600;
        targetHeight = 800;
      } else if (selectedRatio === 'free') {
        targetWidth = 800;
        targetHeight = Math.round((800 * natH) / natW);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Move coordinate space to exact center of canvas
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // Apply rotation & mirror
      ctx.rotate((rotation * Math.PI) / 180);
      if (isFlipped) ctx.scale(-1, 1);

      // Measure current on-screen frame box
      const cWidth = containerRef.current?.clientWidth || containerDimensions.width || 300;
      const cHeight = containerRef.current?.clientHeight || containerDimensions.height || 300;

      // Calculate the EXACT base scale displayed on screen
      const baseScale = Math.max(cWidth / natW, cHeight / natH);
      const dispW = natW * baseScale;
      const dispH = natH * baseScale;

      // Scalar multiplier from on-screen pixels to canvas pixels
      const S = targetWidth / cWidth;

      const finalRenderW = dispW * zoom * S;
      const finalRenderH = dispH * zoom * S;

      // Projected offset
      const drawX = (position.x * S) - finalRenderW / 2;
      const drawY = (position.y * S) - finalRenderH / 2;

      ctx.drawImage(image, drawX, drawY, finalRenderW, finalRenderH);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
      onCropComplete(imageSrc);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  }, [containerDimensions.height, containerDimensions.width, imageSrc, isFlipped, naturalSize.height, naturalSize.width, onClose, onCropComplete, position.x, position.y, rotation, selectedRatio, zoom]);

  if (!isOpen || !imageSrc) return null;

  // Visual aspect frame styles
  const frameRatioClass = {
    '1:1': 'aspect-square max-w-[280px] sm:max-w-[320px]',
    '16:9': 'aspect-video max-w-[360px] sm:max-w-[420px]',
    '4:3': 'aspect-[4/3] max-w-[320px] sm:max-w-[360px]',
    '3:4': 'aspect-[3/4] max-w-[240px] sm:max-w-[280px]',
    'free': 'aspect-square max-w-[320px]',
  }[selectedRatio];

  // Screen display scale calculation
  const cWidth = containerDimensions.width || 300;
  const cHeight = containerDimensions.height || 300;
  const natW = naturalSize.width || 800;
  const natH = naturalSize.height || 800;
  const baseScale = Math.max(cWidth / natW, cHeight / natH);
  const dispW = Math.round(natW * baseScale);
  const dispH = Math.round(natH * baseScale);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden animate-scale-in text-slate-900 dark:text-white my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                फ़ोटो क्रॉप करें (Crop & Center Frame)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                फ़ोटो फ्रेम के बीच में सेट करें और व्यवस्थित करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Aspect Ratio Selector Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedRatio('1:1')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedRatio === '1:1'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              1:1 (वर्ग / Square)
            </button>

            <button
              type="button"
              onClick={() => setSelectedRatio('16:9')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedRatio === '16:9'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              16:9 (बैनर / Banner)
            </button>

            <button
              type="button"
              onClick={() => setSelectedRatio('3:4')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedRatio === '3:4'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              3:4 (पासपोर्ट / ID)
            </button>
          </div>

          {/* Viewport / Crop Canvas Box */}
          <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-slate-800 select-none">
            {/* Draggable Viewport Frame */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative overflow-hidden border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] rounded-xl cursor-grab active:cursor-grabbing w-full flex items-center justify-center ${frameRatioClass}`}
            >
              {/* 3x3 Grid Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 opacity-30">
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div></div>
              </div>

              {/* Target Image being Cropped - Matched 1:1 with Canvas */}
              <img
                src={imageSrc}
                alt="Crop target"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${dispW}px`,
                  height: `${dispH}px`,
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                    isFlipped ? -1 : 1
                  })`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                className="pointer-events-none select-none z-10 object-fill"
              />
            </div>

            {/* Drag Hint Overlay */}
            <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] text-white/60 pointer-events-none z-30">
              <Move className="w-3 h-3" />
              <span>खींचकर बीच में सेट करें (Drag to center)</span>
            </div>
          </div>

          {/* Action Controls: Zoom, Rotate, Flip */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Rotate and Mirror Buttons */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs text-[11px]"
                >
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>90° घुमाएं</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs text-[11px]"
                >
                  <FlipHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>मिरर (Flip)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setIsFlipped(false);
                  setPosition({ x: 0, y: 0 });
                }}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:underline cursor-pointer font-semibold"
              >
                रीसेट (Reset to Center)
              </button>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-xl text-xs font-bold"
            >
              रद्द करें (Cancel)
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="rounded-xl text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  प्रोसेसिंग...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  क्रॉप लागू करें (Apply Crop)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
