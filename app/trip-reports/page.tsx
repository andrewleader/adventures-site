import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripReportsClientPage from './client-page';

export const revalidate = 300;

export default async function TripReportsPage() {
  try {
    let tripReports = await client.queries.tripReportConnection({
      sort: 'startDate',
      last: 1
    });
    const allTripReports = tripReports;

    if (!allTripReports.data.tripReportConnection.edges) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Trip Reports</h1>
            <p>No trip reports found.</p>
          </div>
        </Layout>
      );
    }

    while (tripReports.data?.tripReportConnection.pageInfo.hasPreviousPage) {
      tripReports = await client.queries.tripReportConnection({
        sort: 'startDate',
        before: tripReports.data.tripReportConnection.pageInfo.endCursor,
      });

      if (!tripReports.data.tripReportConnection.edges) {
        break;
      }

      allTripReports.data.tripReportConnection.edges.push(...tripReports.data.tripReportConnection.edges.reverse());
    }

    return (
      <Layout rawPageData={allTripReports.data}>
        <TripReportsClientPage {...allTripReports} />
      </Layout>
    );
  } catch (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Trip Reports</h1>
          <p>Trip reports will be available once TinaCMS is configured.</p>
        </div>
      </Layout>
    );
  }
}