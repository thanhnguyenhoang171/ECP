'use client';
import React from 'react';
import { Layout } from 'antd';

export default function NextAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ padding: '24px' }}>{children}</Layout.Content>
    </Layout>
  );
}
