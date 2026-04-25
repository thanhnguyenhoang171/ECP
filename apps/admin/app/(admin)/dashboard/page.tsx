'use client';

import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!m-0 text-gray-800">Bảng điều khiển</Title>
        <Text type="secondary">Chào mừng trở lại! Hệ thống đang hoạt động bình thường.</Text>
      </div>
      <div className="p-8 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
        Đang tải dữ liệu tóm tắt...
      </div>
    </div>
  );
}
