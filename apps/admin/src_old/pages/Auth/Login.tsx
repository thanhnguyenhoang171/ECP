import { type FC, useState } from 'react';
import Form from 'antd/es/form';
import Checkbox from 'antd/es/checkbox';
import message from 'antd/es/message';
import { Button, Input, FormControl, Card } from '../../components/common';
import UserOutlined from '@ant-design/icons/es/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/es/icons/LockOutlined';
import GoogleOutlined from '@ant-design/icons/es/icons/GoogleOutlined';
import FacebookFilled from '@ant-design/icons/es/icons/FacebookFilled';
import ArrowRightOutlined from '@ant-design/icons/es/icons/ArrowRightOutlined';
import LoginOutlined from '@ant-design/icons/es/icons/LoginOutlined';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
}

const Login: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('access_token', 'fake_token_123');
      message.success('Đăng nhập hệ thống thành công!');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <Card 
      title={<span className="text-base font-bold text-slate-800 flex items-center gap-2"><LoginOutlined className="text-primary-600" /> Đăng nhập hệ thống</span>}
      className="shadow-xl border-slate-100"
    >
      <div className="mb-6">
        <p className="text-sm text-slate-500 m-0">
          Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục.
        </p>
      </div>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        size="large"
        autoComplete="off"
        requiredMark={false}
      >
        <FormControl
          name="username"
          control={control}
          label="Tên đăng nhập"
          error={errors.username?.message}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="admin" 
          />
        </FormControl>

        <FormControl
          name="password"
          control={control}
          label="Mật khẩu"
          error={errors.password?.message}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="••••••••" 
          />
        </FormControl>

        <div className="flex items-center justify-between mb-8">
          <Controller
            name="remember"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox 
                checked={value} 
                onChange={(e) => onChange(e.target.checked)}
              >
                Ghi nhớ tôi
              </Checkbox>
            )}
          />
          <div className="text-sm">
            <a href="#" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            fullWidth
            size="large"
            loading={loading}
          >
            Đăng nhập ngay <ArrowRightOutlined />
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-slate-400 uppercase tracking-wider text-[10px] font-bold">Hoặc đăng nhập với</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button className="w-full border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 h-11">
            <GoogleOutlined className="text-[#EA4335] text-lg flex items-center" /> Google
          </Button>
          <Button className="w-full border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 h-11">
            <FacebookFilled className="text-[#1877F2] text-lg flex items-center" /> Facebook
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Chưa có quyền truy cập?{' '}
        <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 transition-colors underline-offset-4 hover:underline">
          Đăng ký tài khoản mới
        </Link>
      </p>
    </Card>
  );
};

export default Login;
