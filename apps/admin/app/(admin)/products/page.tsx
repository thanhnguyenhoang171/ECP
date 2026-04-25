'use client';

import React from 'react';
import { Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function ProductPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Button type="primary" icon={<PlusOutlined />}>Thêm sản phẩm</Button>
      </div>
      <Table columns={[{ title: 'Tên', dataIndex: 'name' }]} dataSource={[]} />
    </div>
  );
}
