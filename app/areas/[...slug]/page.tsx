import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import AreaClientPage from './client-page';

export default async function AreaPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const area = await client.queries.area({
      relativePath: `${slug}.mdx`,
    });

    const routes = await client.queries.routeConnection({
      filter: {
        parentArea: {
          area: {
            title: { eq: area.data.area.title },
          },
        },
      },
    });

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