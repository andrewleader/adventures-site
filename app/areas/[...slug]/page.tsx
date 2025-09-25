import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import AreaClientPage from './client-page';

export default async function AreaPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  
  try {
    const [area, routes] = await Promise.all([
      client.queries.area({
        relativePath: `${slug}.mdx`,
      }),
      client.queries.routeConnection({
        first: 1000  // Fetch up to 1000 routes instead of the default 50
      })
    ]);

    return (
      <Layout rawPageData={area.data}>
        <AreaClientPage {...area} routesData={routes.data} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const areas = await client.queries.areaConnection();
    return areas.data.areaConnection.edges?.map((area) => ({
      slug: area?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch {
    return [];
  }
}