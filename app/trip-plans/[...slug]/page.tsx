import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripPlanClientPage from './client-page';

const getTripPlan = cache(async (relativePath: string) => client.queries.tripPlan({ relativePath }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  try {
    const { data } = await getTripPlan(`${slug}.mdx`);
    const tripPlan = data.tripPlan;

    const destinationTitles = (tripPlan.destinations || [])
      .map((destination) => (destination?.route && typeof destination.route === 'object' ? destination.route.title : null))
      .filter(Boolean);

    const description = destinationTitles.length > 0
      ? `Trip plan for ${destinationTitles.join(', ')}.`
      : `Trip plan: ${tripPlan.title}.`;

    return {
      title: `${tripPlan.title} | Trip Plan`,
      description,
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  // For static builds, we'll generate params based on the filesystem
  // This avoids API calls during build time that can fail due to rate limits or server issues
  const fs = require('fs');
  const path = require('path');
  
  try {
    const contentDir = path.join(process.cwd(), 'content', 'trip-plans');
    const files = fs.readdirSync(contentDir);
    
    return files
      .filter((file: string) => file.endsWith('.mdx'))
      .map((file: string) => ({
        slug: [file.replace('.mdx', '')]
      }));
  } catch (error) {
    console.error('Error generating static params for trip plans:', error);
    return [];
  }
}

export default async function TripPlanPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const tripPlan = await getTripPlan(`${slug}.mdx`);

    return (
      <Layout rawPageData={tripPlan.data}>
        <TripPlanClientPage {...tripPlan} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}