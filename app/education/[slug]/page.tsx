import React from 'react';
import { EducationCategorySection } from '@/src/components/pages/EducationCategorySection';

export default async function EducationCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EducationCategorySection slug={slug} />;
}
