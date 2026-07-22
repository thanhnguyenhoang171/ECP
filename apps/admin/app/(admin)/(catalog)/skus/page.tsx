import React from 'react';
import SkusView from '@/features/skus/components/SkusView';

export default async function SkusPage({
  _searchParams,
}: {
  _searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <SkusView />;
}
