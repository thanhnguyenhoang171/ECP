'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { CategoryDetailView } from '@/features/categories/components/CategoryDetailView';

export default function CategoryDetailPage(): React.JSX.Element {
  const params = useParams();
  const id = (params?.id as string) || '';

  return <CategoryDetailView id={id} />;
}
