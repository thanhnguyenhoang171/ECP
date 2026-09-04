'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BrandDetailView } from '@/features/brands/components/BrandDetailView';

export default function BrandDetailPage(): React.JSX.Element {
  const params = useParams();
  const id = (params?.id as string) || '';

  return <BrandDetailView id={id} />;
}
