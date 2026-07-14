'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MarkdownImageData } from '@/lib/markdown-image-gallery';
import { getDisplayImageSrc, getDisplayImageSrcSet, IMAGE_SIZES } from '@/lib/images';

export type { MarkdownImageData };

interface MarkdownImageGalleryProps {
  images?: MarkdownImageData[] | MarkdownImageData;
}

/** Assumed aspect ratio while images are still loading (typical outdoor landscape) */
const DEFAULT_RATIO = 1.5;

/**
 * Renders one or more images from markdown content. A single image is shown
 * centered at its natural aspect ratio; adjacent images (grouped upstream by
 * `groupAdjacentImages`) are shown as a compact, justified thumbnail strip.
 * Images remain plain `<img>` elements so the site-wide click-to-zoom
 * lightbox (see `useImageGallery`) picks them up automatically.
 */
export default function MarkdownImageGallery({ images }: MarkdownImageGalleryProps) {
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  const normalizedImages = useMemo(() => {
    const imageList = Array.isArray(images) ? images : images ? [images] : [];
    return imageList.filter((image) => image?.src && image.src.trim().length > 0);
  }, [images]);

  const isGallery = normalizedImages.length > 1;

  /** Capture natural dimensions when each thumbnail loads so flex widths update to true ratios. */
  const handleImageLoad = useCallback((src: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setAspectRatios((prev) => ({ ...prev, [src]: naturalWidth / naturalHeight }));
    }
  }, []);

  if (normalizedImages.length === 0) {
    return null;
  }

  if (isGallery) {
    return (
      <div className="not-prose my-6 flex flex-wrap gap-1 overflow-hidden rounded-xl">
        {normalizedImages.map((image, index) => {
          const ratio = aspectRatios[image.src] ?? DEFAULT_RATIO;
          // min-width prevents the image from shrinking below a readable size;
          // combined with flex-wrap this causes items to wrap to a new row on
          // narrow screens rather than being squished into an unusable strip.
          const minWidth = Math.max(80, ratio * 120);
          return (
            <figure
              key={`${image.src}-${index}`}
              className="group relative h-52 overflow-hidden sm:h-72"
              style={{ flex: `${ratio} ${ratio} 0`, minWidth: `${minWidth}px` }}
            >
              <img
                src={getDisplayImageSrc(image.src)}
                srcSet={getDisplayImageSrcSet(image.src)}
                sizes={IMAGE_SIZES}
                alt={image.alt || ''}
                loading="lazy"
                className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={(e) => handleImageLoad(image.src, e)}
              />
              {image.alt ? (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-3 py-3 text-xs leading-snug text-white">
                  {image.alt}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    );
  }

  const [image] = normalizedImages;
  return (
    <div className="not-prose my-6 flex flex-col items-center">
      <figure className="flex flex-col items-center">
        <img
          src={getDisplayImageSrc(image.src, true)}
          alt={image.alt || ''}
          loading="lazy"
          className="max-h-[500px] w-auto max-w-full cursor-zoom-in rounded-2xl object-contain shadow-lg transition-transform duration-200 hover:scale-[1.01]"
        />
        {image.alt ? (
          <figcaption className="mt-2 text-center text-sm italic text-muted-foreground">
            {image.alt}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
