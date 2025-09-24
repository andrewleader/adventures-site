import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import AreasClientPage from './client-page';

export const revalidate = 300;

export default async function AreasPage() {
  try {
    let areas = await client.queries.areaConnection({
      sort: 'title',
      last: 1
    });
    const allAreas = areas;

    if (!allAreas.data.areaConnection.edges) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Areas</h1>
            <p>No areas found.</p>
          </div>
        </Layout>
      );
    }

    while (areas.data?.areaConnection.pageInfo.hasPreviousPage) {
      areas = await client.queries.areaConnection({
        sort: 'title',
        before: areas.data.areaConnection.pageInfo.endCursor,
      });

      if (!areas.data.areaConnection.edges) {
        break;
      }

      allAreas.data.areaConnection.edges.push(...areas.data.areaConnection.edges.reverse());
    }

    return (
      <Layout rawPageData={allAreas.data}>
        <AreasClientPage {...allAreas} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Areas</h1>
          <p>Areas will be available once TinaCMS is configured.</p>
        </div>
      </Layout>
    );
  }
}