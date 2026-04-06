import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, UsergroupAddOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Tổng quan hệ thống</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Doanh thu hôm nay"
              value={112893}
              precision={0}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
              prefix={<ArrowUpOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Đơn hàng mới"
              value={93}
              valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
              prefix={<ShoppingCartOutlined />}
              suffix="Đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Khách hàng mới"
              value={12}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              prefix={<UsergroupAddOutlined />}
              suffix="Người"
            />
          </Card>
        </Col>
      </Row>
      
      <div className="mt-8 p-8 sm:p-20 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
        <p className="text-center italic">Khu vực biểu đồ thống kê (Tối ưu hiển thị theo thiết bị)</p>
      </div>
    </div>
  );
};

export default Dashboard;