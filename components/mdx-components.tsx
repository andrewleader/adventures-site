import { format } from 'date-fns';
import React from 'react';
import { Components, TinaMarkdown, TinaMarkdownContent } from 'tinacms/dist/rich-text';
import Image from 'next/image';
import { Prism } from 'tinacms/dist/rich-text/prism';
import { Video } from './blocks/video';
import { PageBlocksVideo } from '@/tina/__generated__/types';
import { Mermaid } from './blocks/mermaid';
import { RouteOverlay } from './route-overlay';
import MarkdownImageGallery, { MarkdownImageData } from './markdown-image-gallery';
import { getDisplayImageSrc } from '@/lib/images';

export const components: Components<{
  BlockQuote: {
    children: TinaMarkdownContent;
    authorName: string;
  };
  DateTime: {
    format?: string;
  };
  NewsletterSignup: {
    placeholder: string;
    buttonText: string;
    children: TinaMarkdownContent;
    disclaimer?: TinaMarkdownContent;
  };
  video: PageBlocksVideo;
  RouteOverlay: {
    imageSrc: string;
    topoData?: string;
    topoOverlaySrc?: string;
  };
  gallery: {
    images: MarkdownImageData[];
  };
}> = {
  code_block: (props) => {
    if (!props) {
      return <></>;
    }
    
    if (props.lang === 'mermaid') {
      return <Mermaid value={props.value} />
    }

    return <Prism lang={props.lang} value={props.value} />;
  },
  BlockQuote: (props: {
    children: TinaMarkdownContent;
    authorName: string;
  }) => {
    return (
      <div>
        <blockquote>
          <TinaMarkdown content={props.children} />
          {props.authorName}
        </blockquote>
      </div>
    );
  },
  DateTime: (props) => {
    const dt = React.useMemo(() => {
      return new Date();
    }, []);

    switch (props.format) {
      case 'iso':
        return <span>{format(dt, 'yyyy-MM-dd')}</span>;
      case 'utc':
        return <span>{format(dt, 'eee, dd MMM yyyy HH:mm:ss OOOO')}</span>;
      case 'local':
        return <span>{format(dt, 'P')}</span>;
      default:
        return <span>{format(dt, 'P')}</span>;
    }
  },
  NewsletterSignup: (props) => {
    return (
      <div className='bg-white'>
        <div className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className=''>
            <TinaMarkdown content={props.children} />
          </div>
          <div className='mt-8 '>
            <form className='sm:flex'>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email-address'
                type='email'
                autoComplete='email'
                required
                className='w-full px-5 py-3 border border-gray-300 shadow-xs placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs rounded-md'
                placeholder={props.placeholder}
              />
              <div className='mt-3 rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:shrink-0'>
                <button
                  type='submit'
                  className='w-full flex items-center justify-center py-3 px-5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                >
                  {props.buttonText}
                </button>
              </div>
            </form>
            <div className='mt-3 text-sm text-gray-500'>{props.disclaimer && <TinaMarkdown content={props.disclaimer} />}</div>
          </div>
        </div>
      </div>
    );
  },
  img: (props) => {
    if (!props) {
      return <></>;
    }
    return (
      <span className='flex items-center justify-center'>
        <Image src={getDisplayImageSrc(props.url)} alt={props.alt || ''} width={500} height={500} />
      </span>
    );
  },
  mermaid: (props: any) => <Mermaid {...props} />,
  video: (props) => {
    return <Video data={props} />;
  },
  RouteOverlay: (props: {
    imageSrc: string;
    topoData?: string;
    topoOverlaySrc?: string;
  }) => {
    return <RouteOverlay {...props} />;
  },
  gallery: (props: { images: MarkdownImageData[] }) => {
    return <MarkdownImageGallery images={props.images} />;
  },
};
