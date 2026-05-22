import React from 'react';
import ProfileView from '@/features/profile/components/ProfileView';

export default async function ProfilePage() {
  // Giả lập Server Data Fetching
  const initialData = {
    fullName: "Admin User",
    email: "admin@ecp.vn",
    phone: "0987654321",
    role: "Quản trị viên",
  };

  return <ProfileView initialData={initialData} />;
}
