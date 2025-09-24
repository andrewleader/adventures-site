import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripPlansClientPage from './client-page';

export const revalidate = 300;

export default async function TripPlansPage() {
  try {
    let tripPlans = await client.queries.tripPlanConnection({
      sort: 'startDate',
      last: 1
    });
    const allTripPlans = tripPlans;

    if (!allTripPlans.data.tripPlanConnection.edges) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Trip Plans</h1>
            <p>No trip plans found.</p>
          </div>
        </Layout>
      );
    }

    while (tripPlans.data?.tripPlanConnection.pageInfo.hasPreviousPage) {
      tripPlans = await client.queries.tripPlanConnection({
        sort: 'startDate',
        before: tripPlans.data.tripPlanConnection.pageInfo.endCursor,
      });

      if (!tripPlans.data.tripPlanConnection.edges) {
        break;
      }

      allTripPlans.data.tripPlanConnection.edges.push(...tripPlans.data.tripPlanConnection.edges.reverse());
    }

    return (
      <Layout rawPageData={allTripPlans.data}>
        <TripPlansClientPage {...allTripPlans} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Trip Plans</h1>
          <p>Trip plans will be available once TinaCMS is configured.</p>
        </div>
      </Layout>
    );
  }
}