'use client';

import React, { use } from 'react';
import RoleDetailView from '@/features/roles/components/RoleDetailView';

interface RoleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RoleDetailPage({ params }: RoleDetailPageProps): React.JSX.Element {
  const { id } = use(params);

  return <RoleDetailView id={id} />;
}
