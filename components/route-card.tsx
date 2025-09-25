import { Route } from '@/tina/__generated__/types';
import Link from 'next/link';
import Image from 'next/image';
import { getRouteDifficultyText } from './route-difficulty';

interface RouteCardProps {
  route: Route;
  showImage?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function RouteCard({ 
  route, 
  showImage = true, 
  size = 'medium',
  className = ''
}: RouteCardProps) {
  const routeSlug = route._sys?.relativePath?.replace('.mdx', '') || '';
  
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };
  
  const titleSizes = {
    small: 'text-sm font-medium',
    medium: 'text-lg font-semibold',
    large: 'text-xl font-semibold'
  };
  
  const imageSizes = {
    small: 'h-20',
    medium: 'h-32',
    large: 'h-40'
  };

  return (
    <Link 
      href={`/routes/${routeSlug}`}
      className={`block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all ${sizeClasses[size]} ${className}`}
    >
      {/* Route Featured Image */}
      {showImage && route.featuredImage && (
        <div className={`aspect-video relative mb-3 rounded-md overflow-hidden ${imageSizes[size]}`}>
          <Image
            src={route.featuredImage}
            alt={route.title || 'Route image'}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <h3 className={`mb-2 text-gray-900 hover:text-green-600 ${titleSizes[size]}`}>
        {route.title}
      </h3>
      
      {/* Route Details */}
      <div className="space-y-1 text-sm text-gray-600">
        {route.classRating && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🧗</span>
            <span className="font-medium">{getRouteDifficultyText(route)}</span>
          </div>
        )}
        
        {route.pitches && route.classRating === 'class5' && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">⛰️</span>
            <span>{route.pitches} pitch{route.pitches !== 1 ? 'es' : ''}</span>
          </div>
        )}
        
        {route.miles && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📏</span>
            <span>{route.miles} miles</span>
          </div>
        )}
        
        {route.gain && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">⬆️</span>
            <span>+{route.gain}ft elevation</span>
          </div>
        )}
        
        {route.highestElevation && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🏔️</span>
            <span>{route.highestElevation}ft max</span>
          </div>
        )}
      </div>
      
      {/* Route Type Badge */}
      <div className="mt-3">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
          Route
        </span>
        {route.parentArea && typeof route.parentArea === 'object' && route.parentArea.title && (
          <span className="ml-2 text-xs text-blue-600">
            in {route.parentArea.title}
          </span>
        )}
      </div>
    </Link>
  );
}