import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import MapClientPage from './client-page';

export const revalidate = 300;

export default async function MapPage() {
  try {
    let areas = await client.queries.areaConnection({
      sort: 'title',
      first: 1000  // Fetch up to 1000 areas
    });
    
    let routes = await client.queries.routeListConnection({
      sort: 'title',
      first: 1000  // Fetch up to 1000 routes
    });

    return (
      <Layout>
        <MapClientPage areasData={areas.data} routesData={routes.data} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Map</h1>
          <p>Map will be available once TinaCMS is configured and Google Maps API is set up.</p>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note:</strong> To enable the interactive map, you'll need to:
            </p>
            <ul className="mt-2 ml-4 list-disc text-yellow-700">
              <li>Get a Google Maps API key</li>
              <li>Add it to your environment variables as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
              <li>Install the @googlemaps/js-api-loader package</li>
            </ul>
          </div>
        </div>
      </Layout>
    );
  }
}