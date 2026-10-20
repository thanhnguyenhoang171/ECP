import React from 'react';
import ProfileView from '@/features/profile/components/ProfileView';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }): Promise<React.JSX.Element> {
  const { tab } = await searchParams;
  return <ProfileView initialTab={tab === 'purge' ? 'purge' : 'general'} />;
}
