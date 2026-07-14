import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import RouteClientPage from './client-page';
import { getRouteDifficultyText } from '@/components/route-difficulty';
import type { Route } from '@/tina/__generated__/types';

const getRoute = cache(async (relativePath: string) => client.queries.route({ relativePath }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  try {
    const { data } = await getRoute(`${slug}.mdx`);
    const route = data.route as Route;
    const areaTitle = route.parentArea && typeof route.parentArea === 'object' ? route.parentArea.title : null;

    const title = areaTitle ? `${route.title} (${areaTitle})` : route.title;

    const difficulty = route.classRating ? getRouteDifficultyText(route) : null;
    const descriptionParts = [
      `${route.title} is a climbing route${areaTitle ? ` in ${areaTitle}` : ''}`,
      difficulty ? `rated ${difficulty}` : null,
      route.pitches ? `(${route.pitches} pitch${route.pitches > 1 ? 'es' : ''})` : null,
    ].filter(Boolean);
    const description = `${descriptionParts.join(' ')}.`;

    return {
      title,
      description,
    };
  } catch {
    return {};
  }
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const route = await getRoute(`${slug}.mdx`);

    const relativePath = `${slug}.mdx`;
    let tripReportEdges: NonNullable<Awaited<ReturnType<typeof client.queries.tripReportListConnection>>['data']['tripReportConnection']['edges']> = [];
    try {
      const tripReports = await client.queries.tripReportListConnection({
        sort: 'startDate',
        first: 1000, // Get a large number to ensure we get all trip reports
      });
      tripReportEdges = (tripReports.data.tripReportConnection.edges || []).filter((edge) =>
        edge?.node?.destinations?.some(
          (destination) => destination?.route && typeof destination.route === 'object' && destination.route._sys?.relativePath === relativePath
        )
      );
    } catch (error) {
      console.error('Error fetching trip reports for route:', error);
    }

    let tripPlanEdges: NonNullable<Awaited<ReturnType<typeof client.queries.tripPlanListConnection>>['data']['tripPlanConnection']['edges']> = [];
    try {
      const tripPlans = await client.queries.tripPlanListConnection({
        sort: 'startDate',
        first: 1000, // Get a large number to ensure we get all trip plans
      });
      tripPlanEdges = (tripPlans.data.tripPlanConnection.edges || []).filter((edge) =>
        edge?.node?.destinations?.some(
          (destination) => destination?.route && typeof destination.route === 'object' && destination.route._sys?.relativePath === relativePath
        )
      );
    } catch (error) {
      console.error('Error fetching trip plans for route:', error);
    }

    return (
      <Layout rawPageData={route.data}>
        <RouteClientPage {...route} tripReports={tripReportEdges} tripPlans={tripPlanEdges} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    let routes = await client.queries.routeConnection();
    const allRoutes = routes;

    while (routes.data.routeConnection.pageInfo.hasNextPage) {
      routes = await client.queries.routeConnection({
        after: routes.data.routeConnection.pageInfo.endCursor,
      });

      if (!routes.data.routeConnection.edges) {
        break;
      }

      allRoutes.data.routeConnection.edges!.push(...routes.data.routeConnection.edges);
    }

    return allRoutes.data.routeConnection.edges?.map((route) => ({
      slug: route?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch {
    return [];
  }
}