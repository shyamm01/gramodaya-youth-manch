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
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { computeDisplayDimensions, renderCroppedImage } from '@/src/lib/canvasCropper';

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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 800, height: 800 });
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 300, height: 300 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialZoomOnPinchRef = useRef<number>(1);

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

  // ── Ultra-Smooth Pointer Events (Mouse & Touch unified) ──
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with left click or single touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: Math.round(e.clientX - dragStartRef.current.x),
      y: Math.round(e.clientY - dragStartRef.current.y),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  // ── Multi-touch Pinch to Zoom on Mobile ──
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialZoomOnPinchRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialPinchDistRef.current) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialPinchDistRef.current;
      const newZoom = Math.min(3.5, Math.max(0.5, initialZoomOnPinchRef.current * factor));
      setZoom(parseFloat(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
  };

  // ── Smooth Mouse Wheel Zoom ──
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => {
      const next = Math.min(3.5, Math.max(0.5, prev + delta));
      return parseFloat(next.toFixed(2));
    });
  };

  // Double click/tap to toggle center & zoom
  const handleDoubleClick = () => {
    if (zoom !== 1 || position.x !== 0 || position.y !== 0) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoom(1.4);
    }
  };

  // Step Zoom Controls
  const stepZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.min(3.5, Math.max(0.5, prev + delta));
      return parseFloat(next.toFixed(2));
    });
  };

  // Perform Final Canvas Crop - 100% WYSIWYG
  const handleApplyCrop = useCallback(async () => {
    if (!imageSrc) return;

    try {
      setIsProcessing(true);
      const croppedDataUrl = await renderCroppedImage({
        imageSrc,
        selectedRatio,
        zoom,
        rotation,
        isFlipped,
        position,
        containerWidth: containerRef.current?.clientWidth || containerDimensions.width || 300,
        containerHeight: containerRef.current?.clientHeight || containerDimensions.height || 300,
        naturalWidth: naturalSize.width || 800,
        naturalHeight: naturalSize.height || 800,
      });

      onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
      onCropComplete(imageSrc);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  }, [containerDimensions.height, containerDimensions.width, imageSrc, isFlipped, naturalSize.height, naturalSize.width, onClose, onCropComplete, position, rotation, selectedRatio, zoom]);

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
  const { dispW, dispH } = computeDisplayDimensions(
    naturalSize.width,
    naturalSize.height,
    containerDimensions.width,
    containerDimensions.height
  );

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
                फ़ोटो क्रॉप करें (Crop & Frame Photo)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                फ़ोटो को ज़ूम, रोटेट और फ्रेम के बीच में आसानी से सेट करें
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

          {/* Viewport / Crop Canvas Box with Hardware Acceleration */}
          <div
            onWheel={handleWheel}
            className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-slate-800 select-none touch-none"
          >
            {/* Draggable Viewport Frame */}
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              className={`relative overflow-hidden border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.78)] rounded-2xl cursor-grab active:cursor-grabbing w-full flex items-center justify-center ${frameRatioClass}`}
            >
              {/* 3x3 Grid Guidelines Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 opacity-35">
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
                  transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                    isFlipped ? -1 : 1
                  })`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  willChange: isDragging ? 'transform' : 'auto',
                  transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
                }}
                className="pointer-events-none select-none z-10 object-fill"
              />
            </div>

            {/* Gesture Hints Overlay */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-white/70 pointer-events-none z-30">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-emerald-400" />
                खींचकर सेट करें (Drag to pan)
              </span>
              <span className="hidden sm:inline opacity-80">
                माउस स्क्रॉल या पिंच से ज़ूम करें (Scroll to zoom)
              </span>
            </div>
          </div>

          {/* Action Controls: Zoom, Quick Steps, Rotate, Flip */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Zoom Slider with +/- buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stepZoom(-0.15)}
                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <button
                type="button"
                onClick={() => stepZoom(0.15)}
                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 min-w-[42px] text-right font-mono">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Rotate, Flip and Recenter Buttons */}
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
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                रीसेट (Center)
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
              className="rounded-xl text-xs font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white min-w-[125px]"
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
