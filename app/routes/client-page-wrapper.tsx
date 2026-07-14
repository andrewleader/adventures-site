'use client';

import { useEffect, useState } from 'react';
import { RouteListConnectionQuery } from '@/tina/__generated__/types';
import RoutesClientPage from './client-page';

interface RoutesClientPageWrapperProps {
  initialData: RouteListConnectionQuery;
}

export default function RoutesClientPageWrapper({ initialData }: RoutesClientPageWrapperProps) {
  const [data, setData] = useState<RouteListConnectionQuery | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(initialData);
    setError(null);
  }, [initialData]);

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