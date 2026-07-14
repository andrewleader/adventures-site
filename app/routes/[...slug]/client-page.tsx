'use client';

import { RouteQuery, Route, TripReportListConnectionQuery, TripPlanListConnectionQuery } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';
import { getRouteDifficultyText } from '@/components/route-difficulty';
import { groupAdjacentImages } from '@/lib/markdown-image-gallery';
import { formatDate } from '@/lib/format-date';

type TripReportEdge = NonNullable<TripReportListConnectionQuery['tripReportConnection']['edges']>[number];
type TripPlanEdge = NonNullable<TripPlanListConnectionQuery['tripPlanConnection']['edges']>[number];

interface RouteClientPageProps {
  data: RouteQuery;
  variables: {
    relativePath: string;
  };
  query: string;
  tripReports?: TripReportEdge[];
  tripPlans?: TripPlanEdge[];
}

export default function RouteClientPage({ data, variables, query, tripReports, tripPlans }: RouteClientPageProps) {
  const route = data.route as Route;

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <nav className="mb-4">
          <Link href="/routes" className="text-green-600 hover:text-green-700">
            ← Back to Routes
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{route.title}</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {route.miles && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{route.miles}</div>
              <div className="text-sm text-gray-600">Miles</div>
            </div>
          )}
          {route.gain && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{route.gain.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Elevation Gain (ft)</div>
            </div>
          )}
          {route.highestElevation && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{route.highestElevation.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Max Elevation (ft)</div>
            </div>
          )}
          {route.classRating && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{getRouteDifficultyText(route)}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          )}
        </div>

        {/* Additional Route Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {route.pitches && route.classRating === 'class5' && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
              🧗 {route.pitches} pitch{route.pitches > 1 ? 'es' : ''}
            </span>
          )}
          {route.parentArea && typeof route.parentArea === 'object' && route.parentArea.title && (
            <Link 
              href={`/areas/${route.parentArea._sys?.filename}`}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              📍 {route.parentArea.title}
            </Link>
          )}
        </div>

        {/* Trip Reports for this route */}
        {tripReports && tripReports.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
              📝 Trip Reports ({tripReports.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {tripReports.map((edge, index) => {
                const report = edge?.node;
                if (!report) return null;
                const date = formatDate(report.startDate);
                return (
                  <li key={report._sys?.filename || index}>
                    <Link
                      href={`/trip-reports/${report._sys?.filename}`}
                      className="flex items-center justify-between gap-4 px-3 py-2 bg-white rounded-md border border-green-100 hover:border-green-300 hover:shadow-sm transition-all group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-green-700">{report.title}</span>
                      {date && <span className="text-sm text-gray-500 shrink-0">{date}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Trip Plans for this route */}
        {tripPlans && tripPlans.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3">
              🗓️ Trip Plans ({tripPlans.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {tripPlans.map((edge, index) => {
                const plan = edge?.node;
                if (!plan) return null;
                const date = formatDate(plan.startDate);
                return (
                  <li key={plan._sys?.filename || index}>
                    <Link
                      href={`/trip-plans/${plan._sys?.filename}`}
                      className="flex items-center justify-between gap-4 px-3 py-2 bg-white rounded-md border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-blue-700">{plan.title}</span>
                      {date && <span className="text-sm text-gray-500 shrink-0">{date}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </header>

      {/* Featured Image */}
      {route.featuredImage && (
        <div className="mb-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={route.featuredImage}
              alt={route.title || 'Route image'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* CalTopo Map */}
      {route.calTopoUrl && (
        <div className="mb-8 rounded-lg overflow-hidden border">
          <iframe
            width="100%"
            height="500"
            src={route.calTopoUrl}
            title="CalTopo Map"
            loading="lazy"
          >
            <a href={route.calTopoUrl} target="_blank" rel="noopener noreferrer">View map</a>
          </iframe>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {route._body && <TinaMarkdown content={groupAdjacentImages(route._body)} components={components} />}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Resources</h3>
        <div className="flex flex-wrap gap-4">
          {route.gpxFile && (
            <a
              href={route.gpxFile}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📱 Download GPX
            </a>
          )}
          
          {route.mountainForecastUrl && (
            <a
              href={route.mountainForecastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🌤️ Weather Forecast
            </a>
          )}
        </div>
      </div>
    </article>
  );
}