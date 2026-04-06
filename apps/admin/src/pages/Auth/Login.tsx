import React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Login values:', values);
    
    // Giả lập đăng nhập thành công sau 1 giây
    setTimeout(() => {
      localStorage.setItem('access_token', 'fake_token_123');
      message.success('Chào mừng bạn quay trở lại!');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2 italic">ECP Admin</h1>
          <p className="text-gray-500">Hệ thống quản trị bán hàng hiện đại</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Tên đăng nhập (admin)" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
          </Form.Item>

          <div className="flex justify-between items-center mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi nhớ tôi</Checkbox>
            </Form.Item>
            <a className="text-blue-600 hover:text-blue-500 text-sm" href="#">
              Quên mật khẩu?
            </a>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full font-bold h-12 text-lg" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="text-center text-gray-500">
            Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline font-medium">Đăng ký ngay</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;