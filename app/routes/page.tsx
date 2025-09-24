import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import RoutesClientPage from './client-page';

export const revalidate = 300;

export default async function RoutesPage() {
  try {
    let routes = await client.queries.routeConnection({
      sort: 'title',
      last: 1
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

    while (routes.data?.routeConnection.pageInfo.hasPreviousPage) {
      routes = await client.queries.routeConnection({
        sort: 'title',
        before: routes.data.routeConnection.pageInfo.endCursor,
      });

      if (!routes.data.routeConnection.edges) {
        break;
      }

      allRoutes.data.routeConnection.edges.push(...routes.data.routeConnection.edges.reverse());
    }

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