import React from 'react';
import { VisionMissionCategorySection } from '@/src/components/pages/VisionMissionCategorySection';

export default async function VisionMissionCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <VisionMissionCategorySection slug={slug} />;
}
