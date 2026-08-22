import React from 'react';
import { EducationResourceSection } from '@/src/components/pages/EducationResourceSection';

export default async function EducationResourcePage({
  params,
}: {
  params: Promise<{ slug: string; resourceSlug: string }>;
}) {
  const { slug, resourceSlug } = await params;
  return <EducationResourceSection categorySlug={slug} resourceSlug={resourceSlug} />;
}
