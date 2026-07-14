import type { TinaMarkdownContent } from 'tinacms/dist/rich-text';

export interface MarkdownImageData {
  src: string;
  alt?: string;
}

/** Block-level node types whose children may themselves contain image-only paragraphs. */
const CONTAINER_TYPES = new Set(['blockquote', 'ul', 'ol', 'li', 'lic']);

/**
 * Returns the images contained in a paragraph node if (and only if) the
 * paragraph's only meaningful content is one or more images. Explicit line
 * breaks and whitespace-only text between images are ignored so that images
 * separated by a single newline (no blank line) are treated the same as
 * images sitting right next to each other or in separate paragraphs.
 */
function extractImagesFromParagraph(node: any): MarkdownImageData[] | null {
  if (!node || node.type !== 'p' || !Array.isArray(node.children)) {
    return null;
  }

  const images: MarkdownImageData[] = [];
  for (const child of node.children) {
    if (child.type === 'img') {
      images.push({
        src: String(child.url || ''),
        alt: child.alt ? String(child.alt) : undefined,
      });
    } else if (child.type === 'break') {
      // explicit line break between images — ignore
    } else if (child.type === 'text' && typeof child.text === 'string' && child.text.replace(/\n/g, '').trim() === '') {
      // whitespace / newline-only text — ignore
    } else {
      // real non-image content: this is not an image-only paragraph
      return null;
    }
  }

  return images.length > 0 ? images : null;
}

function makeGalleryNode(images: MarkdownImageData[]): any {
  return {
    type: 'mdxJsxFlowElement',
    name: 'gallery',
    props: { images },
    children: [],
  };
}

function processChildren(children: any[]): any[] {
  if (!Array.isArray(children)) {
    return children;
  }

  const nextChildren: any[] = [];
  let index = 0;

  while (index < children.length) {
    const node = children[index];

    // Recurse into block-level containers first so their children get processed.
    if (node && CONTAINER_TYPES.has(node.type) && Array.isArray(node.children)) {
      nextChildren.push({ ...node, children: processChildren(node.children) });
      index += 1;
      continue;
    }

    const paragraphImages = extractImagesFromParagraph(node);

    if (!paragraphImages) {
      nextChildren.push(node);
      index += 1;
      continue;
    }

    const allImages: MarkdownImageData[] = [...paragraphImages];
    index += 1;

    // Collect any immediately following image-only paragraphs into the same gallery.
    while (index < children.length) {
      const currentImages = extractImagesFromParagraph(children[index]);
      if (!currentImages) break;
      allImages.push(...currentImages);
      index += 1;
    }

    nextChildren.push(makeGalleryNode(allImages));
  }

  return nextChildren;
}

/**
 * Preprocesses a TinaMarkdown content tree so that runs of adjacent
 * image-only paragraphs are merged into a single `gallery` node (rendered as
 * a clickable multi-image gallery) instead of one standalone `<img>` per
 * line.
 */
export function groupAdjacentImages<T extends TinaMarkdownContent | TinaMarkdownContent[] | null | undefined>(content: T): T {
  if (!content) {
    return content;
  }

  if (Array.isArray(content)) {
    return processChildren(content) as T;
  }

  if (!Array.isArray((content as any).children)) {
    return content;
  }

  return {
    ...(content as any),
    children: processChildren((content as any).children),
  } as T;
}
