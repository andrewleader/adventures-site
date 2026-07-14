'use client';

import { TripReportQuery, TripReport } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';
import { groupAdjacentImages } from '@/lib/markdown-image-gallery';
import { formatDate } from '@/lib/format-date';

interface TripReportClientPageProps {
  data: TripReportQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function TripReportClientPage({ data }: TripReportClientPageProps) {
  const tripReport = data.tripReport as TripReport;

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <nav className="mb-4">
          <Link href="/trip-reports" className="text-green-600 hover:text-green-700">
            ← Back to Trip Reports
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{tripReport.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {tripReport.startDate && (
            <span>📅 Start: {formatDate(tripReport.startDate, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
          )}
          {tripReport.endDate && (
            <span>📅 End: {formatDate(tripReport.endDate, { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
          )}
          {tripReport.destinations && tripReport.destinations.length > 0 && (
            <span>
              📍{' '}
              {tripReport.destinations.map((dest, index) => {
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

        {tripReport.tripPlan && typeof tripReport.tripPlan === 'object' && tripReport.tripPlan.title && (
          <div className="mt-4">
            <Link 
              href={`/trip-plans/${tripReport.tripPlan._sys?.filename}`}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              🗓️ Based on plan: {tripReport.tripPlan.title}
            </Link>
          </div>
        )}
      </header>

      {tripReport.featuredImage && (
        <div className="mb-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={tripReport.featuredImage}
              alt={tripReport.title || 'Trip report image'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        {tripReport._body && <TinaMarkdown content={groupAdjacentImages(tripReport._body)} components={components} />}
      </div>


    </article>
  );
}