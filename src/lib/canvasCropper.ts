export interface CropFrameOptions {
  imageSrc: string;
  selectedRatio: '1:1' | '16:9' | '4:3' | '3:4' | 'free';
  zoom: number;
  rotation: number;
  isFlipped: boolean;
  position: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

export function computeDisplayDimensions(
  natW: number,
  natH: number,
  cWidth: number,
  cHeight: number
): { dispW: number; dispH: number } {
  const safeNatW = natW || 800;
  const safeNatH = natH || 800;
  const safeCWidth = cWidth || 300;
  const safeCHeight = cHeight || 300;

  const baseScale = Math.max(safeCWidth / safeNatW, safeCHeight / safeNatH);
  return {
    dispW: Math.round(safeNatW * baseScale),
    dispH: Math.round(safeNatH * baseScale),
  };
}

export async function renderCroppedImage(options: CropFrameOptions): Promise<string> {
  const {
    imageSrc,
    selectedRatio,
    zoom,
    rotation,
    isFlipped,
    position,
    containerWidth,
    containerHeight,
    naturalWidth,
    naturalHeight,
  } = options;

  const image = new Image();
  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
    image.crossOrigin = 'anonymous';
  }

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = (err) => reject(new Error('Failed to load image for canvas cropping: ' + String(err)));
    image.src = imageSrc;
  });

  const natW = image.naturalWidth || naturalWidth || 800;
  const natH = image.naturalHeight || naturalHeight || 800;

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
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  if (isFlipped) ctx.scale(-1, 1);

  const cWidth = containerWidth || 300;
  const cHeight = containerHeight || 300;

  const baseScale = Math.max(cWidth / natW, cHeight / natH);
  const dispW = natW * baseScale;
  const dispH = natH * baseScale;

  const S = targetWidth / cWidth;
  const finalRenderW = dispW * zoom * S;
  const finalRenderH = dispH * zoom * S;

  const drawX = position.x * S - finalRenderW / 2;
  const drawY = position.y * S - finalRenderH / 2;

  ctx.drawImage(image, drawX, drawY, finalRenderW, finalRenderH);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}
