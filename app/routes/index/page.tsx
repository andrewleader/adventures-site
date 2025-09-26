import Layout from '@/components/layout/layout';
import client from '@/lib/static-tina-client';
import RoutesClientPage from './client-page';

export const revalidate = 300;

export default async function RoutesPage() {
  try {
    let routes = await client.queries.routeConnection({
      sort: 'title',
      first: 1000, // Get a large number to ensure we get all routes
    });
    const allRoutes = routes;

    if (!allRoutes.data.routeConnection.edges) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Routes</h1>
            <p>No routes found.</p>
          </div>
        </Layout>
      );
    }

    // Removed the pagination loop since we're getting all at once

    return (
      <Layout rawPageData={allRoutes.data}>
        <RoutesClientPage {...allRoutes} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Routes</h1>
          <p>Routes will be available once TinaCMS is configured.</p>
        </div>
      </Layout>
    );
  }
}
