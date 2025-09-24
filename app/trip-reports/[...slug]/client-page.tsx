'use client';

import { TripReportQuery, TripReport } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface TripReportClientPageProps {
  data: TripReportQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function TripReportClientPage({ data }: TripReportClientPageProps) {
  const tripReport = data.tripReport as TripReport;

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
          <Link href="/trip-reports" className="text-green-600 hover:text-green-700">
            ← Back to Trip Reports
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{tripReport.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {tripReport.startDate && (
            <span>📅 Start: {formatDate(tripReport.startDate)}</span>
          )}
          {tripReport.endDate && (
            <span>📅 End: {formatDate(tripReport.endDate)}</span>
          )}
          {tripReport.destinations && (
            <span>📍 {tripReport.destinations.length} destination{tripReport.destinations.length > 1 ? 's' : ''}</span>
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
        {tripReport._body && <TinaMarkdown content={tripReport._body} />}
      </div>

      {tripReport.destinations && tripReport.destinations.length > 0 && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Destinations Visited</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {tripReport.destinations.map((dest, index) => {
              if (!dest) return null;
              
              return (
                <div key={index} className="p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold">
                    {typeof dest.route === 'object' && dest.route?.title 
                      ? dest.route.title 
                      : 'Route'}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}