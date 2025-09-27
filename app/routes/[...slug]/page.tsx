import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import RouteClientPage from './client-page';

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const route = await client.queries.route({
      relativePath: `${slug}.mdx`,
    });

    return (
      <Layout rawPageData={route.data}>
        <RouteClientPage {...route} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const routes = await client.queries.routeConnection();
    return routes.data.routeConnection.edges?.map((route) => ({
      slug: route?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch {
    return [];
  }
}