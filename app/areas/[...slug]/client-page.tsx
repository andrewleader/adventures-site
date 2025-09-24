'use client';

import { AreaQuery, Area } from '@/tina/__generated__/types';
import Image from 'next/image';
import Link from 'next/link';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { components } from '@/components/mdx-components';

interface AreaClientPageProps {
  data: AreaQuery;
  variables: {
    relativePath: string;
  };
  query: string;
}

export default function AreaClientPage({ data, variables, query }: AreaClientPageProps) {
  const area = data.area as Area;

  const parseCoordinates = (coordString: string | null | undefined) => {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  };

  const coords = parseCoordinates(area.summitCoords);

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <nav className="mb-4">
          <Link href="/areas" className="text-green-600 hover:text-green-700">
            ← Back to Areas
          </Link>
        </nav>
        
        <h1 className="text-4xl font-bold mb-4">{area.title}</h1>
        
        {/* Meta information */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {coords && (
            <span>📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          )}
          {area.mountainForecastUrl && (
            <a 
              href={area.mountainForecastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              🌤️ Weather Forecast
            </a>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {area.featuredImage && (
        <div className="mb-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={area.featuredImage}
              alt={area.title || 'Area image'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {area._body && <TinaMarkdown content={area._body} components={components} />}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/routes"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View All Routes
          </Link>
          
          {coords && (
            <a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in Google Maps
            </a>
          )}
          
          {area.mountainForecastUrl && (
            <a
              href={area.mountainForecastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Check Weather
            </a>
          )}
        </div>
      </div>
    </article>
  );
}