import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/lib/static-tina-client';
import TripReportClientPage from './client-page';

export default async function TripReportPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const tripReport = await client.queries.tripReport({
      relativePath: `${slug}.mdx`,
    });

    return (
      <Layout rawPageData={tripReport.data}>
        <TripReportClientPage {...tripReport} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const tripReports = await client.queries.tripReportConnection({
      first: 1000
    });

    return tripReports.data.tripReportConnection.edges?.map((tripReport: any) => ({
      slug: tripReport?.node?._sys.breadcrumbs || [],
    })) || [];
  } catch (error) {
    console.error('Error generating static params for trip reports:', error);
    return [];
  }
}