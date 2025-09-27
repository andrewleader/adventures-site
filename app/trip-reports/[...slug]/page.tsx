import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
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