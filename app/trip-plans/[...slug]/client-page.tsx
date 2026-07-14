'use client';

import { TripPlanQuery, TripPlan } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';
import { groupAdjacentImages } from '@/lib/markdown-image-gallery';

interface TripPlanClientPageProps {
  data: TripPlanQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function TripPlanClientPage({ data }: TripPlanClientPageProps) {
  const tripPlan = data.tripPlan as TripPlan;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <nav className="mb-4">
          <Link href="/trip-plans" className="text-green-600 hover:text-green-700">
            ← Back to Trip Plans
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{tripPlan.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {tripPlan.startDate && (
            <span>📅 Start: {formatDate(tripPlan.startDate)}</span>
          )}
          {tripPlan.endDate && (
            <span>📅 End: {formatDate(tripPlan.endDate)}</span>
          )}
          {tripPlan.destinations && tripPlan.destinations.length > 0 && (
            <span>
              📍{' '}
              {tripPlan.destinations.map((dest, index) => {
                const route = dest?.route;
                const title = typeof route === 'object' && route?.title ? route.title : null;
                const slug = typeof route === 'object' && route?._sys?.breadcrumbs
                  ? (route._sys.breadcrumbs as string[]).join('/')
                  : null;
                return (
                  <span key={index}>
                    {index > 0 && ', '}
                    {title && slug ? (
                      <Link href={`/routes/${slug}`} className="text-green-600 hover:text-green-700 hover:underline">
                        {title}
                      </Link>
                    ) : (
                      title || 'Unknown'
                    )}
                  </span>
                );
              })}
            </span>
          )}
        </div>
      </header>

      {tripPlan.featuredImage && (
        <div className="mb-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={tripPlan.featuredImage}
              alt={tripPlan.title || 'Trip plan image'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {tripPlan._body && <TinaMarkdown content={groupAdjacentImages(tripPlan._body)} components={components} />}
      </div>
    </article>
  );
}