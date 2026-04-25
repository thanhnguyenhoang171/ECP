'use client';

import React from 'react';
import { Card, Statistic, Row, Col, Table, List, Avatar, Tag, Progress, Badge, Typography, Tooltip, Space } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ShoppingCartOutlined, 
  UsergroupAddOutlined, 
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  EllipsisOutlined,
  QuestionCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DashboardPage() {
  // Mock data for recent orders
  const recentOrders = [
    {
      key: '1',
      id: '#ORD-7281',
      customer: 'Nguyễn Văn A',
      amount: '1,250,000 đ',
      status: 'completed',
      date: '2024-03-20 14:30',
    },
    {
      key: '2',
      id: '#ORD-7282',
      customer: 'Trần Thị B',
      amount: '850,000 đ',
      status: 'pending',
      date: '2024-03-20 15:45',
    },
    {
      key: '3',
      id: '#ORD-7283',
      customer: 'Lê Văn C',
      amount: '2,100,000 đ',
      status: 'processing',
      date: '2024-03-20 16:20',
    },
    {
      key: '4',
      id: '#ORD-7284',
      customer: 'Phạm Thị D',
      amount: '450,000 đ',
      status: 'completed',
      date: '2024-03-20 17:05',
    },
    {
      key: '5',
      id: '#ORD-7285',
      customer: 'Hoàng Văn E',
      amount: '1,780,000 đ',
      status: 'cancelled',
      date: '2024-03-20 18:00',
    },
  ];

  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong className="text-blue-600">{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let label = 'Chờ xử lý';
        if (status === 'completed') { color = 'success'; label = 'Hoàn thành'; }
        if (status === 'processing') { color = 'processing'; label = 'Đang giao'; }
        if (status === 'cancelled') { color = 'error'; label = 'Đã hủy'; }
        if (status === 'pending') { color = 'warning'; label = 'Chờ thanh toán'; }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      className: 'hidden md:table-cell',
    },
  ];

  // Mock data for top products
  const topProducts = [
    {
      name: 'iPhone 15 Pro Max',
      sales: 145,
      revenue: '4.350.000.000 đ',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=iPhone',
    },
    {
      name: 'MacBook Pro M3',
      sales: 82,
      revenue: '3.690.000.000 đ',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MacBook',
    },
    {
      name: 'AirPods Pro 2',
      sales: 312,
      revenue: '1.872.000.000 đ',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AirPods',
    },
    {
      name: 'Apple Watch Series 9',
      sales: 124,
      revenue: '1.240.000.000 đ',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Watch',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} className="!m-0 text-gray-800">Bảng điều khiển</Title>
          <Text type="secondary">Chào mừng trở lại! Đây là tóm tắt hoạt động của cửa hàng hôm nay.</Text>
        </div>
        <div className="flex gap-3">
          <Badge status="processing" text="Hệ thống trực tuyến" className="hidden sm:inline-flex" />
          <Space>
            <Tooltip title="Làm mới dữ liệu">
              <ReloadOutlined className="p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" />
            </Tooltip>
            <Tag color="blue" className="!m-0 px-3 py-1 text-sm font-medium">Hôm nay</Tag>
          </Space>
        </div>
      </div>
      
      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarOutlined className="text-xl text-blue-500" />
              </div>
              <Tooltip title="Tăng 12% so với hôm qua">
                <Tag color="success" className="flex items-center gap-1">
                  <ArrowUpOutlined /> 12%
                </Tag>
              </Tooltip>
            </div>
            <Statistic
              title={
                <Space>
                  <span>Tổng doanh thu</span>
                  <Tooltip title="Doanh thu tính từ 0h hôm nay">
                    <QuestionCircleOutlined className="text-gray-400 text-xs" />
                  </Tooltip>
                </Space>
              }
              value={128450000}
              precision={0}
              suffix="đ"
              valueStyle={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <div className="mt-2 text-xs text-gray-400">So với tháng trước: +15.4M đ</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-orange-500">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <ShoppingCartOutlined className="text-xl text-orange-500" />
              </div>
              <Tooltip title="Tăng 8% so với hôm qua">
                <Tag color="success" className="flex items-center gap-1">
                  <ArrowUpOutlined /> 8%
                </Tag>
              </Tooltip>
            </div>
            <Statistic
              title="Đơn hàng mới"
              value={156}
              valueStyle={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <div className="mt-2 text-xs text-gray-400">24 đơn hàng đang chờ xử lý</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <UsergroupAddOutlined className="text-xl text-green-500" />
              </div>
              <Tooltip title="Giảm 3% so với tuần trước">
                <Tag color="error" className="flex items-center gap-1">
                  <ArrowDownOutlined /> 3%
                </Tag>
              </Tooltip>
            </div>
            <Statistic
              title="Khách hàng mới"
              value={42}
              valueStyle={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <div className="mt-2 text-xs text-gray-400">Tổng cộng: 1,240 khách hàng</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-500">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ShoppingOutlined className="text-xl text-purple-500" />
              </div>
              <div className="flex items-center text-purple-500 font-medium text-xs">Mục tiêu: 85%</div>
            </div>
            <Statistic
              title="Tỉ lệ chuyển đổi"
              value={3.24}
              precision={2}
              suffix="%"
              valueStyle={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
            <Progress percent={75} size="small" strokeColor="#87d068" showInfo={false} className="mt-2" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Revenue Chart Placeholder */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex justify-between items-center">
                <span>Biểu đồ doanh thu</span>
                <Space>
                  <Tag color="blue" className="cursor-pointer !m-0">7 ngày</Tag>
                  <Tag className="cursor-pointer !m-0">30 ngày</Tag>
                </Space>
              </div>
            }
            extra={<EllipsisOutlined className="cursor-pointer" />}
            bordered={false} 
            className="shadow-sm h-full"
          >
            <div className="relative h-[300px] w-full bg-gray-50/50 rounded-lg overflow-hidden flex flex-col items-center justify-center border border-dashed border-gray-200">
              {/* Simulated Chart with SVG */}
              <svg viewBox="0 0 800 300" className="absolute inset-0 w-full h-full p-4 opacity-40">
                <path 
                  d="M0,250 Q100,220 200,240 T400,180 T600,200 T800,100" 
                  fill="none" 
                  stroke="#1677ff" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <path 
                  d="M0,250 Q100,220 200,240 T400,180 T600,200 T800,100 V300 H0 Z" 
                  fill="url(#gradient)" 
                  opacity="0.2"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1677ff" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[50, 100, 150, 200, 250].map(y => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#eee" strokeWidth="1" />
                ))}
              </svg>
              <div className="z-10 flex flex-col items-center">
                <RiseOutlined className="text-4xl text-blue-500 mb-2 animate-bounce" />
                <Text strong>Tăng trưởng 24% so với tuần trước</Text>
                <Text type="secondary" className="text-xs mt-1">Dữ liệu được cập nhật theo thời gian thực</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} lg={8}>
          <Card 
            title="Sản phẩm bán chạy" 
            bordered={false} 
            className="shadow-sm h-full"
            extra={<a href="/products" className="text-blue-600 text-xs">Tất cả</a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={topProducts}
              renderItem={(item) => (
                <List.Item className="!px-0 border-b-gray-50 last:border-b-0">
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} shape="square" size={48} className="shadow-sm" />}
                    title={<Text strong className="hover:text-blue-600 cursor-pointer">{item.name}</Text>}
                    description={<Text type="secondary" className="text-xs">{item.sales} lượt bán</Text>}
                  />
                  <div className="text-right">
                    <Text strong className="block text-green-600">{item.revenue}</Text>
                    <Text type="secondary" className="text-[10px]">Xu hướng: +5%</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card 
        title="Đơn hàng gần đây" 
        extra={<a href="/orders" className="text-blue-600 text-sm font-medium hover:underline">Xem tất cả đơn hàng</a>}
        bordered={false} 
        className="shadow-sm overflow-hidden"
      >
        <Table 
          columns={orderColumns} 
          dataSource={recentOrders} 
          pagination={false} 
          size="middle"
          scroll={{ x: 600 }}
          className="ant-table-custom"
        />
      </Card>
    </div>
  );
}
