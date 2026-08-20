import React from 'react';
import { EmploymentCategorySection } from '@/src/components/pages/EmploymentCategorySection';

export default async function EmploymentCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EmploymentCategorySection slug={slug} />;
}
