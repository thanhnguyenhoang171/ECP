import React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      console.log('Register values:', values);
      // Giả lập gọi API đăng ký
      // await authService.register(values);
      message.success('Đăng ký tài khoản thành công!');
      navigate('/login');
    } catch {
      // Lỗi đã được xử lý ở axiosInstance
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2 italic">ECP Admin</h1>
          <p className="text-gray-500">Tạo tài khoản quản trị mới</p>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Tên người dùng" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ!' },
              { required: true, message: 'Vui lòng nhập Email!' }
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Địa chỉ Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Form.Item name="agreement" valuePropName="checked" rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với các điều khoản')),
            },
          ]}>
            <Checkbox>
              Tôi đồng ý với <a href="#" className="text-blue-600">điều khoản dịch vụ</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full font-bold h-12 text-lg" loading={loading}>
              Đăng ký ngay
            </Button>
          </Form.Item>

          <div className="text-center text-gray-500">
            Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;