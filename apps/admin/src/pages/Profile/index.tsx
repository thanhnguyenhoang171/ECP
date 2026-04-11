import React from 'react';
import { Card, Form, Input, Button, Row, Col, Avatar, Upload, message, Typography } from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProfileValues {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

const Profile: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: ProfileValues) => {
    console.log('Success:', values);
    message.success('Cập nhật thông tin thành công!');
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!m-0 text-gray-800">Hồ sơ cá nhân</Title>
        <Typography.Text type="secondary">Quản lý thông tin cá nhân và bảo mật tài khoản</Typography.Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm text-center">
            <div className="flex flex-col items-center space-y-4">
              <Avatar size={120} icon={<UserOutlined />} className="bg-blue-600" />
              <Upload showUploadList={false} action="/api/upload">
                <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
              </Upload>
              <div>
                <Title level={4} className="!m-0">Admin User</Title>
                <Typography.Text type="secondary">admin@ecp.vn</Typography.Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thông tin cơ bản" bordered={false} className="shadow-sm">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                fullName: 'Admin User',
                email: 'admin@ecp.vn',
                phone: '0987654321',
                role: 'Quản trị viên'
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                  >
                    <Input placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="Nhập email" disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Vai trò"
                    name="role"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end mt-4">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </Card>
          
          <Card title="Đổi mật khẩu" bordered={false} className="shadow-sm mt-6">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Xác nhận mật khẩu mới" />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end mt-4">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Cập nhật mật khẩu
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;