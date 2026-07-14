import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import RoutesClientPageWrapper from './client-page-wrapper';

export const revalidate = 300;

export default async function RoutesPage() {
  const routes = await client.queries.routeListConnection({
    sort: 'date',
    last: 24,
  });

  return (
    <Layout>
      <RoutesClientPageWrapper initialData={routes.data} />
    </Layout>
  );
}