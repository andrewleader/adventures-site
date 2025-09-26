import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/lib/static-tina-client';
import TripPlanClientPage from './client-page';

export default async function TripPlanPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const tripPlan = await client.queries.tripPlan({
      relativePath: `${slug}.mdx`,
    });

    return (
      <Layout rawPageData={tripPlan.data}>
        <TripPlanClientPage {...tripPlan} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const tripPlans = await client.queries.tripPlanConnection({
      first: 1000
    });

    return tripPlans.data.tripPlanConnection.edges?.map((tripPlan: any) => ({
      slug: tripPlan?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch (error) {
    console.error('Error generating static params for trip plans:', error);
    return [];
  }
}