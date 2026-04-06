import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface DataType {
  key: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

const data: DataType[] = [
  {
    key: '1',
    name: 'Áo thun nam Basic Premium',
    price: 150000,
    stock: 120,
    status: 'active',
  },
  {
    key: '2',
    name: 'Quần Jeans xanh Slimfit',
    price: 350000,
    stock: 50,
    status: 'active',
  },
  {
    key: '3',
    name: 'Giày Sneaker Sport v2',
    price: 550000,
    stock: 0,
    status: 'out_of_stock',
  },
];

const Products: React.FC = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text) => <span className="font-medium text-blue-600 cursor-pointer">{text}</span>,
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => <span className="font-semibold">{price.toLocaleString()}đ</span>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (_, { status }) => {
        let color = status === 'active' ? 'green' : 'volcano';
        let text = status === 'active' ? 'Đang bán' : 'Hết hàng';
        return <Tag color={color} className="rounded-full px-3">{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} className="text-blue-500" />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <Button type="primary" icon={<PlusOutlined />} className="w-full sm:w-auto h-10 font-medium">
          Thêm sản phẩm
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={data} 
          scroll={{ x: 800 }} // Cho phép cuộn ngang trên màn hình nhỏ
          pagination={{
            pageSize: 5,
            responsive: true,
          }}
        />
      </div>
    </div>
  );
};

export default Products;