/**
 * Helpers for our Azure-hosted images, which are stored with both a
 * `/large/` (full resolution) and `/thumbnails/` variant under the same
 * filename, e.g.:
 *   https://leaderimages.blob.core.windows.net/images/large/n-t0hIx03Otc.jpg
 *   https://leaderimages.blob.core.windows.net/images/thumbnails/n-t0hIx03Otc.jpg
 */
const HOSTED_IMAGE_BASE = 'https://leaderimages.blob.core.windows.net/images/';

export const IMAGE_SIZES = '(max-width: 600px) 400px, 1920px';

export function isHostedImageUrl(url: string): boolean {
  return !!url && (url.startsWith(`${HOSTED_IMAGE_BASE}large/`) || url.startsWith(`${HOSTED_IMAGE_BASE}thumbnails/`));
}

export function toHostedLargeUrl(url: string): string {
  if (!isHostedImageUrl(url)) {
    return url;
  }
  return url.replace('/thumbnails/', '/large/');
}

export function toHostedThumbnailUrl(url: string): string {
  if (!isHostedImageUrl(url)) {
    return url;
  }
  return url.replace('/large/', '/thumbnails/');
}

/**
 * Returns the URL to use as the default `src` for a hosted image.
 * Pass `preferLarge = true` to get the full-resolution large variant
 * (e.g. for lightbox display); defaults to the thumbnail variant.
 */
export function getDisplayImageSrc(url: string, preferLarge = false): string {
  if (!isHostedImageUrl(url)) {
    return url;
  }
  return preferLarge ? toHostedLargeUrl(url) : toHostedThumbnailUrl(url);
}

export function getDisplayImageSrcSet(url: string): string | undefined {
  if (!isHostedImageUrl(url)) {
    return undefined;
  }
  const largeUrl = toHostedLargeUrl(url);
  const thumbnailUrl = toHostedThumbnailUrl(largeUrl);
  return `${thumbnailUrl} 400w, ${largeUrl} 1920w`;
}
