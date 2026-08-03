'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { useAuthStore } from '@/store/authStore';
import { logoutClient } from '@/services/auth.service';

import ProfileHeaderBanner from '@/components/profile/ProfileHeaderBanner';
import ProfileSidebar, { ProfileTabType } from '@/components/profile/ProfileSidebar';
import ProfileInfoTab from '@/components/profile/ProfileInfoTab';
import ProfileOrdersTab from '@/components/profile/ProfileOrdersTab';
import ProfileAddressesTab from '@/components/profile/ProfileAddressesTab';
import ProfileSecurityTab from '@/components/profile/ProfileSecurityTab';

function ProfileContent() {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('profile');
  const { user, isLoading, clearAuth } = useAuthStore();
  const router = useRouter();

  const isDataLoading = isLoading || !user;

  const handleLogout = async () => {
    await logoutClient();
    clearAuth();
    toast.success('Đã đăng xuất thành công!');
    router.push('/');
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Profile Header Banner */}
        <ProfileHeaderBanner user={user} isDataLoading={isDataLoading} />

        {/* Layout Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
            />
          </div>

          {/* Tab Content Panels */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <ProfileInfoTab user={user} isDataLoading={isDataLoading} />
            )}
            {activeTab === 'orders' && <ProfileOrdersTab />}
            {activeTab === 'addresses' && (
              <ProfileAddressesTab user={user} isDataLoading={isDataLoading} />
            )}
            {activeTab === 'security' && <ProfileSecurityTab />}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedPage fallback={<ProfileContent />}>
      <ProfileContent />
    </ProtectedPage>
  );
}
