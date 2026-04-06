import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { User } from '../../interfaces';

const data: User[] = [
  {
    id: 1,
    username: 'admin_ecp',
    email: 'admin@ecp.com',
    role: 'admin',
  },
  {
    id: 2,
    username: 'staff_thanh',
    email: 'thanh@ecp.com',
    role: 'staff',
  },
];

const Users: React.FC = () => {
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button type="primary" icon={<UserAddOutlined />}>
          Thêm thành viên
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default Users;