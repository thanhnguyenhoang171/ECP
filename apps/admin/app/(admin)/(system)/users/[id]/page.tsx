'use client';

import React, { use } from 'react';
import { UserDetailView } from '@/features/users/components/UserDetailView';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps): React.JSX.Element {
  const { id } = use(params);

  return <UserDetailView id={id} />;
}
