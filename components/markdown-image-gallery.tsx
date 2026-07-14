'use client';

import { useCallback, useMemo, useState } from 'react';
import useMeasure from 'react-use-measure';
import type { MarkdownImageData } from '@/lib/markdown-image-gallery';
import { getDisplayImageSrc, getDisplayImageSrcSet, IMAGE_SIZES } from '@/lib/images';

export type { MarkdownImageData };

interface MarkdownImageGalleryProps {
  images?: MarkdownImageData[] | MarkdownImageData;
}

/** Assumed aspect ratio while images are still loading (typical outdoor landscape) */
const DEFAULT_RATIO = 1.5;

/** Gap between cells, in px — keep in sync with the row/cell gap classes below. */
const GAP = 4;
const TARGET_ROW_HEIGHT = 260;
const MIN_ROW_HEIGHT = 140;
const MAX_ROW_HEIGHT = 380;
/** Images more extreme than this (very tall portraits / wide panoramas) get their own full-width, letterboxed row instead of being squeezed or cropped into a shared row. */
const EXTREME_TALL_RATIO = 0.5;
const EXTREME_WIDE_RATIO = 2.2;

interface LayoutItem {
  image: MarkdownImageData;
  ratio: number;
}

interface RowItem extends LayoutItem {
  width: number;
}

interface Row {
  items: RowItem[];
  height: number;
  letterboxed?: boolean;
}

function isExtremeRatio(ratio: number): boolean {
  return ratio <= EXTREME_TALL_RATIO || ratio >= EXTREME_WIDE_RATIO;
}

/**
 * Packs images into justified rows, à la Google Photos: every row is scaled
 * so each image keeps its natural aspect ratio while the row exactly fills
 * the container width, so landscape photos naturally take up more
 * horizontal space than portraits without any cropping. A sparse trailing
 * row is left at the target height instead of being stretched to fill the
 * width. Extremely tall or wide images are broken out into their own
 * full-width row (rendered letterboxed) instead of being squeezed into a
 * shared row.
 */
function layoutJustified(items: LayoutItem[], containerWidth: number): Row[] {
  if (containerWidth <= 0) {
    return [];
  }

  const rows: Row[] = [];
  let currentRow: LayoutItem[] = [];

  const packRow = (rowItems: LayoutItem[], allowShortLastRow: boolean) => {
    if (rowItems.length === 0) return;

    const totalGap = GAP * (rowItems.length - 1);
    const availableWidth = Math.max(1, containerWidth - totalGap);
    const ratioSum = rowItems.reduce((sum, item) => sum + item.ratio, 0);
    let rowHeight = availableWidth / ratioSum;

    if (allowShortLastRow && rowHeight > TARGET_ROW_HEIGHT) {
      // Don't stretch a sparse trailing row to fill the width — keep it at
      // the target height and let it sit left-aligned, like Google Photos.
      rowHeight = TARGET_ROW_HEIGHT;
    }

    rowHeight = Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, rowHeight));

    rows.push({
      items: rowItems.map((item) => ({ ...item, width: item.ratio * rowHeight })),
      height: rowHeight,
    });
  };

  const packLetterboxRow = (item: LayoutItem) => {
    const height = Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, TARGET_ROW_HEIGHT));
    rows.push({
      items: [{ ...item, width: containerWidth }],
      height,
      letterboxed: true,
    });
  };

  for (const item of items) {
    if (isExtremeRatio(item.ratio)) {
      packRow(currentRow, false);
      currentRow = [];
      packLetterboxRow(item);
      continue;
    }

    currentRow.push(item);
    const widthAtTargetHeight =
      currentRow.reduce((sum, i) => sum + i.ratio, 0) * TARGET_ROW_HEIGHT + GAP * (currentRow.length - 1);
    if (widthAtTargetHeight >= containerWidth) {
      packRow(currentRow, false);
      currentRow = [];
    }
  }

  packRow(currentRow, true);

  return rows;
}

/**
 * Renders one or more images from markdown content. A single image is shown
 * centered at its natural aspect ratio; adjacent images (grouped upstream by
 * `groupAdjacentImages`) are arranged into a justified gallery so each photo
 * keeps its natural aspect ratio (landscape photos take up more width,
 * portraits less) instead of being uniformly cropped. Images remain plain
 * `<img>` elements so the site-wide click-to-zoom lightbox (see
 * `useImageGallery`) picks them up automatically.
 */
export default function MarkdownImageGallery({ images }: MarkdownImageGalleryProps) {
  const [containerRef, bounds] = useMeasure();
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  const normalizedImages = useMemo(() => {
    const imageList = Array.isArray(images) ? images : images ? [images] : [];
    return imageList.filter((image) => image?.src && image.src.trim().length > 0);
  }, [images]);

  const isGallery = normalizedImages.length > 1;

  /** Capture natural dimensions when each thumbnail loads so the layout updates to true ratios. */
  const handleImageLoad = useCallback((src: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setAspectRatios((prev) => ({ ...prev, [src]: naturalWidth / naturalHeight }));
    }
  }, []);

  const rows = useMemo(() => {
    if (!isGallery) return [];
    const items: LayoutItem[] = normalizedImages.map((image) => ({
      image,
      ratio: aspectRatios[image.src] ?? DEFAULT_RATIO,
    }));
    return layoutJustified(items, bounds.width);
  }, [isGallery, normalizedImages, aspectRatios, bounds.width]);

  if (normalizedImages.length === 0) {
    return null;
  }

  if (isGallery) {
    return (
      <div ref={containerRef} className="not-prose my-6 overflow-hidden rounded-xl">
        {bounds.width > 0 && (
          <div className="flex flex-col gap-1">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.items.map((item, itemIndex) => (
                  <figure
                    key={`${item.image.src}-${itemIndex}`}
                    className={`group relative shrink-0 grow-0 overflow-hidden ${row.letterboxed ? 'bg-black' : ''}`}
                    style={{ width: item.width, height: row.height }}
                  >
                    <img
                      src={getDisplayImageSrc(item.image.src)}
                      srcSet={getDisplayImageSrcSet(item.image.src)}
                      sizes={IMAGE_SIZES}
                      alt={item.image.alt || ''}
                      loading="lazy"
                      className={`h-full w-full cursor-zoom-in transition-transform duration-300 ${
                        row.letterboxed ? 'object-contain' : 'object-cover group-hover:scale-105'
                      }`}
                      onLoad={(e) => handleImageLoad(item.image.src, e)}
                    />
                    {item.image.alt ? (
                      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-3 py-3 text-xs leading-snug text-white">
                        {item.image.alt}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ))}
          </div>
        )}
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
