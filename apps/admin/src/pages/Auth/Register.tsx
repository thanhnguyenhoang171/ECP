import React from 'react';
import { Form, Checkbox, message } from 'antd';
import { Button, Input, FormControl } from '../../components/common';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  UserAddOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

interface RegisterFormData {
  username: string;
  email: string;
  phone_number: string;
  password_hash: string;
  confirm_password: string;
  agreement: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      email: '',
      phone_number: '',
      password_hash: '',
      confirm_password: '',
      agreement: true,
    },
  });

  const onSubmit = (values: RegisterFormData) => {
    setLoading(true);
    console.log('Register values:', values);
    
    // Giả lập đăng ký thành công
    setTimeout(() => {
      message.success('Tạo tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
      setLoading(false);
    }, 1500);
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
          Đăng ký tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Gia nhập đội ngũ vận hành <span className="text-primary-600 font-semibold italic">ECP Admin</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-6 shadow-soft border border-slate-100 sm:rounded-2xl sm:px-10">
          <Form
            layout="vertical"
            onFinish={handleSubmit(onSubmit)}
            size="large"
            autoComplete="off"
            requiredMark={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormControl
                name="username"
                control={control}
                label={<span className="text-slate-700 font-semibold text-sm">Tên đăng nhập</span>}
                error={errors.username?.message}
                required
              >
                <Input 
                  prefix={<UserOutlined className="text-slate-400 mr-2" />} 
                  placeholder="admin_new" 
                  className="rounded-lg border-slate-200 h-11"
                />
              </FormControl>

              <FormControl
                name="email"
                control={control}
                label={<span className="text-slate-700 font-semibold text-sm">Email</span>}
                error={errors.email?.message}
                required
              >
                <Input 
                  prefix={<MailOutlined className="text-slate-400 mr-2" />} 
                  placeholder="admin@ecp.vn" 
                  className="rounded-lg border-slate-200 h-11"
                />
              </FormControl>
            </div>

            <FormControl
              name="phone_number"
              control={control}
              label={<span className="text-slate-700 font-semibold text-sm">Số điện thoại</span>}
              error={errors.phone_number?.message}
              required
            >
              <Input 
                prefix={<PhoneOutlined className="text-slate-400 mr-2" />} 
                placeholder="0987 654 321" 
                className="rounded-lg border-slate-200 h-11"
              />
            </FormControl>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormControl
                name="password_hash"
                control={control}
                label={<span className="text-slate-700 font-semibold text-sm">Mật khẩu</span>}
                error={errors.password_hash?.message}
                required
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-slate-400 mr-2" />} 
                  placeholder="••••••••" 
                  className="rounded-lg border-slate-200 h-11"
                />
              </FormControl>

              <FormControl
                name="confirm_password"
                control={control}
                label={<span className="text-slate-700 font-semibold text-sm">Xác nhận mật khẩu</span>}
                error={errors.confirm_password?.message}
                required
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-slate-400 mr-2" />} 
                  placeholder="••••••••" 
                  className="rounded-lg border-slate-200 h-11"
                />
              </FormControl>
            </div>

            <Form.Item className="mb-8">
              <Checkbox className="text-slate-600 text-sm">
                Tôi đồng ý với <a href="#" className="text-primary-600 font-semibold hover:underline">Điều khoản bảo mật</a> và <a href="#" className="text-primary-600 font-semibold hover:underline">Chính sách vận hành</a>.
              </Checkbox>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full h-12 flex justify-center items-center rounded-lg shadow-soft text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all"
                loading={loading}
              >
                <UserAddOutlined className="mr-2" /> Tạo tài khoản quản trị
              </Button>
            </Form.Item>
          </Form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center">
            <ArrowLeftOutlined className="mr-1 text-xs" /> Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
