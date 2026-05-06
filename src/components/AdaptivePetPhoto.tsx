import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type PhotoMode = 'card' | 'detail' | 'preview' | 'thumb' | 'mini' | 'adminThumb';

const PHOTO_FRAME_PRESETS = [
  { name: 'tall', ratio: 2 / 3 },
  { name: 'portrait', ratio: 4 / 5 },
  { name: 'square', ratio: 1 },
  { name: 'landscape', ratio: 4 / 3 },
  { name: 'wide', ratio: 16 / 9 },
] as const;

const MODE_CLASS: Record<PhotoMode, string> = {
  card: 'h-full w-full rounded-3xl',
  detail: 'w-full max-h-[54dvh] rounded-2xl',
  preview: 'w-full max-h-[48dvh] rounded-2xl',
  thumb: 'h-20 w-20 rounded-xl flex-shrink-0',
  mini: 'h-12 w-12 rounded-xl flex-shrink-0',
  adminThumb: 'h-14 w-14 rounded-xl flex-shrink-0',
};

const IMAGE_SCALE: Record<PhotoMode, number> = {
  card: 1.16,
  detail: 1.08,
  preview: 1.08,
  thumb: 1.14,
  mini: 1.14,
  adminThumb: 1.14,
};

export function pickPhotoFrameRatio(imageRatio: number | null | undefined): number {
  if (!imageRatio || !Number.isFinite(imageRatio) || imageRatio <= 0) {
    return PHOTO_FRAME_PRESETS[1].ratio;
  }

  return PHOTO_FRAME_PRESETS.reduce((best, preset) => {
    const bestDistance = Math.abs(Math.log(imageRatio / best.ratio));
    const distance = Math.abs(Math.log(imageRatio / preset.ratio));
    return distance < bestDistance ? preset : best;
  }).ratio;
}

interface AdaptivePetPhotoProps {
  src: string;
  alt: string;
  mode?: PhotoMode;
  className?: string;
  imageClassName?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
}

export function AdaptivePetPhoto({
  src,
  alt,
  mode = 'detail',
  className,
  imageClassName,
  loading,
}: AdaptivePetPhotoProps) {
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const adaptiveAspect = mode === 'detail' || mode === 'preview';
  const style: CSSProperties | undefined = adaptiveAspect
    ? { aspectRatio: String(pickPhotoFrameRatio(imageRatio)) }
    : undefined;

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-black/35 shadow-inner',
        MODE_CLASS[mode],
        className,
      )}
      style={style}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl"
      />
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading={loading ?? (mode === 'card' ? 'eager' : 'lazy')}
        onLoad={event => {
          const img = event.currentTarget;
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            setImageRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
        className={cn(
          'absolute inset-0 h-full w-full select-none object-contain',
          imageClassName,
        )}
        style={{ transform: `scale(${IMAGE_SCALE[mode]})` }}
      />
    </div>
  );
}
