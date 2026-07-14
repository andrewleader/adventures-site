import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import TripReportClientPage from './client-page';

const getTripReport = cache(async (relativePath: string) => client.queries.tripReport({ relativePath }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  try {
    const { data } = await getTripReport(`${slug}.mdx`);
    const tripReport = data.tripReport;

    const destinationTitles = (tripReport.destinations || [])
      .map((destination) => (destination?.route && typeof destination.route === 'object' ? destination.route.title : null))
      .filter(Boolean);

    const description = destinationTitles.length > 0
      ? `Trip report for ${destinationTitles.join(', ')}.`
      : `Trip report: ${tripReport.title}.`;

    return {
      title: `${tripReport.title} | Trip Report`,
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
    const contentDir = path.join(process.cwd(), 'content', 'trip-reports');
    const files = fs.readdirSync(contentDir);
    
    return files
      .filter((file: string) => file.endsWith('.mdx'))
      .map((file: string) => ({
        slug: [file.replace('.mdx', '')]
      }));
  } catch (error) {
    console.error('Error generating static params for trip reports:', error);
    return [];
  }
}

export default async function TripReportPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');
  
  try {
    const tripReport = await getTripReport(`${slug}.mdx`);

    return (
      <Layout rawPageData={tripReport.data}>
        <TripReportClientPage {...tripReport} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}