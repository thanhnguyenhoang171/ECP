import React from 'react';
import { Table, Tag, Space } from 'antd';
import { useProducts } from '../../hooks/useProducts';
import { Button } from '../../components/common';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ProductPage: React.FC = () => {
  const { data, isLoading } = useProducts();

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    {
      title: 'Kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : 'volcano'}>
          {stock} chiếc
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm sản phẩm
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data?.data} 
        rowKey="id" 
        loading={isLoading}
        pagination={{ total: data?.total }}
      />
    </div>
  );
};

export default ProductPage;
