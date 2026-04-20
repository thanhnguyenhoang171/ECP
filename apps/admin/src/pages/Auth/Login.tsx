import React from 'react';
import { Form, Checkbox, message } from 'antd';
import { Button, Input, FormControl } from '../../components/common';
import { 
  UserOutlined, 
  LockOutlined, 
  GoogleOutlined, 
  FacebookFilled,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

interface LoginFormData {
  username: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

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

  const onSubmit = (_values: LoginFormData) => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('access_token', 'fake_token_123');
      message.success('Đăng nhập hệ thống thành công!');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <span className="text-2xl font-black text-white italic">E</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Chào mừng trở lại
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Vui lòng đăng nhập để quản lý hệ thống <span className="text-primary-600 font-semibold italic">ECP Enterprise</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-soft border border-slate-100 sm:rounded-2xl sm:px-10">
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
              label={<span className="text-slate-700 font-semibold text-sm">Tên đăng nhập</span>}
              error={errors.username?.message}
            >
              <Input 
                prefix={<div className="flex items-center"><UserOutlined className="text-slate-400 mr-2" /></div>} 
                placeholder="admin" 
                className="rounded-lg border-slate-200 h-11"
              />
            </FormControl>

            <FormControl
              name="password"
              control={control}
              label={<span className="text-slate-700 font-semibold text-sm">Mật khẩu</span>}
              error={errors.password?.message}
            >
              <Input.Password 
                prefix={<div className="flex items-center"><LockOutlined className="text-slate-400 mr-2" /></div>} 
                placeholder="••••••••" 
                className="rounded-lg border-slate-200 h-11"
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
                    className="text-slate-600 text-sm flex items-center"
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
                className="w-full h-12 rounded-lg shadow-soft text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all"
                loading={loading}
              >
                Đăng nhập hệ thống <ArrowRightOutlined className="flex items-center ml-1" />
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 uppercase tracking-wider text-[10px] font-bold">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button className="w-full border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 h-11">
                <GoogleOutlined className="text-[#EA4335] text-xl flex items-center" /> Google
              </Button>
              <Button className="w-full border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 h-11">
                <FacebookFilled className="text-[#1877F2] text-xl flex items-center" /> Facebook
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Chưa có quyền truy cập?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 transition-colors underline-offset-4 hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
