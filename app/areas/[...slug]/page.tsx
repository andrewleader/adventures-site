import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import AreaClientPage from './client-page';

const getArea = cache(async (relativePath: string) => client.queries.area({ relativePath }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  try {
    const { data } = await getArea(`${slug}.mdx`);
    const area = data.area;

    return {
      title: area.title,
      description: `Climbing routes and area information for ${area.title}.`,
    };
  } catch {
    return {};
  }
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const area = await getArea(`${slug}.mdx`);

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
    let areas = await client.queries.areaConnection();
    const allAreas = areas;

    while (areas.data.areaConnection.pageInfo.hasNextPage) {
      areas = await client.queries.areaConnection({
        after: areas.data.areaConnection.pageInfo.endCursor,
      });

      if (!areas.data.areaConnection.edges) {
        break;
      }

      allAreas.data.areaConnection.edges!.push(...areas.data.areaConnection.edges);
    }

    return allAreas.data.areaConnection.edges?.map((area) => ({
      slug: area?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch {
    return [];
  }
}