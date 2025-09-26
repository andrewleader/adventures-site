import Layout from '@/components/layout/layout';
import { notFound } from 'next/navigation';
import client from '@/lib/static-tina-client';
import AreasClientPage from './client-page';

export const revalidate = 300;

export default async function AreasPage() {
  try {
    let areas = await client.queries.areaConnection({
      sort: 'title',
      first: 1000, // Get a large number to ensure we get all areas
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

    // Removed the pagination loop since we're getting all at once

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
