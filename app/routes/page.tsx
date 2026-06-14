import Layout from '@/components/layout/layout';
import RoutesClientPageWrapper from './client-page-wrapper';

export const revalidate = 300;

export default function RoutesPage() {
  return (
    <Layout>
      <RoutesClientPageWrapper />
    </Layout>
  );
}