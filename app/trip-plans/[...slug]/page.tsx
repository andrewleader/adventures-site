import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripPlanClientPage from './client-page';

export default async function TripPlanPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  
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