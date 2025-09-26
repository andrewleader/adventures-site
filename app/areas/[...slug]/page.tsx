import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/lib/static-tina-client';
import AreaClientPage from './client-page';

export default async function AreaPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
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
    return areas.data.areaConnection.edges?.map((area: any) => ({
      slug: area?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch {
    return [];
  }
}