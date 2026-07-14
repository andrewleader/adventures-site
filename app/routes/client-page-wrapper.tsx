'use client';

import { useState, useEffect } from 'react';
import { RouteListConnectionQuery } from '@/tina/__generated__/types';
import { client } from '@/tina/__generated__/client';
import RoutesClientPage from './client-page';

export default function RoutesClientPageWrapper() {
  const [data, setData] = useState<RouteListConnectionQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const routes = await client.queries.routeListConnection({
          sort: 'title',
          first: 1000, // Get a large number to ensure we get all routes
        });
        setData(routes.data);
      } catch (err) {
        console.error('Error loading routes:', err);
        setError('Failed to load routes. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Climbing & Hiking Routes</h1>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <p>Loading routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Climbing & Hiking Routes</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.routeConnection.edges) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Climbing & Hiking Routes</h1>
        <p>No routes found.</p>
      </div>
    );
  }

  return <RoutesClientPage data={data} />;
}