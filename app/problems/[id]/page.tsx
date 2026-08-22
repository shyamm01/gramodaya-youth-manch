import React from 'react';
import { Metadata } from 'next';
import { GrievanceDetailPage } from '@/src/components/pages/GrievanceDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Grievance #${id} | Gramodaya Youth Manch`,
    description: `Track and view community grievance #${id} details, status timeline, and resolutions.`,
  };
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <GrievanceDetailPage id={id} />;
}
