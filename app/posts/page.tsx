import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import PostsClientPage from './client-page';

export const revalidate = 300;

export default async function PostsPage() {
  let posts = await client.queries.postConnection({
    sort: 'date',
    first: 1000, // Get a large number to ensure we get all posts
  });
  const allPosts = posts;

  if (!allPosts.data.postConnection.edges) {
    return [];
  }

  // Removed the pagination loop since we're getting all at once

  return (
    <Layout rawPageData={allPosts.data}>
      <PostsClientPage {...allPosts} />
    </Layout>
  );
}
