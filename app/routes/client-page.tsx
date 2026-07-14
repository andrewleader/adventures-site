'use client';

import { Route, RouteFilter, RouteListConnectionQuery } from '@/tina/__generated__/types';
import { useEffect, useState } from 'react';
import { RouteCard } from '@/components/route-card';
import { client } from '@/tina/__generated__/client';

const PAGE_SIZE = 24;

interface RoutesClientPageProps {
  data: RouteListConnectionQuery;
}

export default function RoutesClientPage({ data }: RoutesClientPageProps) {
  const [routesData, setRoutesData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildFilter = () => {
    const filter: RouteFilter = {};
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm) {
      filter.title = { startsWith: trimmedSearchTerm };
    }

    if (classFilter) {
      filter.classRating = { eq: classFilter };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  };

  useEffect(() => {
    if (!searchTerm.trim() && !classFilter) {
      setRoutesData(data);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchFilteredRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const routes = await client.queries.routeListConnection({
          sort: 'title',
          first: PAGE_SIZE,
          filter: buildFilter(),
        });

        if (!cancelled) {
          setRoutesData(routes.data);
        }
      } catch (caughtError) {
        console.error('Error loading routes:', caughtError);
        if (!cancelled) {
          setError('Failed to load routes. Please try refreshing the page.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = window.setTimeout(fetchFilteredRoutes, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceTimer);
    };
  }, [searchTerm, classFilter, data]);
  
  const routes = routesData.routeConnection.edges || [];
  const pageInfo = routesData.routeConnection.pageInfo;

  const loadMoreRoutes = async () => {
    if (!pageInfo.hasNextPage || loadingMore) return;

    try {
      setLoadingMore(true);
      setError(null);
      const nextRoutes = await client.queries.routeListConnection({
        sort: 'title',
        first: PAGE_SIZE,
        after: pageInfo.endCursor,
        filter: buildFilter(),
      });

      setRoutesData({
        ...nextRoutes.data,
        routeConnection: {
          ...nextRoutes.data.routeConnection,
          edges: [
            ...(routesData.routeConnection.edges || []),
            ...(nextRoutes.data.routeConnection.edges || []),
          ],
        },
      });
    } catch (caughtError) {
      console.error('Error loading more routes:', caughtError);
      setError('Failed to load more routes. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Climbing & Hiking Routes</h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search route title prefix..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        
        <select
          value={classFilter}
          onChange={(event) => setClassFilter(event.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Classes</option>
          <option value="class2">Class 2</option>
          <option value="class3">Class 3</option>
          <option value="class4">Class 4</option>
          <option value="class5">Class 5</option>
        </select>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 text-sm text-gray-600">
        <p>
          Showing {routes.length} {routes.length === 1 ? 'route' : 'routes'}
        </p>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-500" />
            <span>Loading routes...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route, index: number) => {
          if (!route?.node) return null;
          
          const routeData = route.node as Route;
          
          return (
            <RouteCard 
              key={route.node._sys?.filename || `route-${index}`}
              route={routeData}
              size="large"
            />
          );
        })}
      </div>

      {pageInfo.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMoreRoutes}
            disabled={loadingMore}
            className="rounded-lg bg-green-700 px-5 py-2 font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? 'Loading...' : 'Load more routes'}
          </button>
        </div>
      )}

      {routes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || classFilter ? 'No routes found matching your filters.' : 'No routes available yet.'}
          </p>
        </div>
      )}
    </div>
  );
}