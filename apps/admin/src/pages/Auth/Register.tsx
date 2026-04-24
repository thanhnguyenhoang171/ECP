import { useState, type FC } from 'react';
import Form from 'antd/es/form';
import Checkbox from 'antd/es/checkbox';
import message from 'antd/es/message';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { Button, Input, FormControl, Card } from '../../components/common';
import UserOutlined from '@ant-design/icons/es/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/es/icons/LockOutlined';
import MailOutlined from '@ant-design/icons/es/icons/MailOutlined';
import PhoneOutlined from '@ant-design/icons/es/icons/PhoneOutlined';
import UserAddOutlined from '@ant-design/icons/es/icons/UserAddOutlined';
import ArrowLeftOutlined from '@ant-design/icons/es/icons/ArrowLeftOutlined';
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

const Register: FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    <Card 
      title={<span className="text-base font-bold text-slate-800 flex items-center gap-2"><UserAddOutlined className="text-primary-600" /> Đăng ký tài khoản</span>}
      className="shadow-xl border-slate-100"
    >
      <div className="mb-6">
        <p className="text-sm text-slate-500 m-0">
          Gia nhập đội ngũ vận hành <span className="text-primary-600 font-semibold italic">ECP Admin</span> ngay hôm nay.
        </p>
      </div>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        size="large"
        autoComplete="off"
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <FormControl
              name="username"
              control={control}
              label="Tên đăng nhập"
              error={errors.username?.message}
              required
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="admin_new" 
              />
            </FormControl>
          </Col>
          <Col xs={24} sm={12}>
            <FormControl
              name="email"
              control={control}
              label="Email"
              error={errors.email?.message}
              required
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="admin@ecp.vn" 
              />
            </FormControl>
          </Col>
        </Row>

        <FormControl
          name="phone_number"
          control={control}
          label="Số điện thoại"
          error={errors.phone_number?.message}
          required
        >
          <Input 
            prefix={<PhoneOutlined />} 
            placeholder="0987 654 321" 
          />
        </FormControl>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <FormControl
              name="password_hash"
              control={control}
              label="Mật khẩu"
              error={errors.password_hash?.message}
              required
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="••••••••" 
              />
            </FormControl>
          </Col>
          <Col xs={24} sm={12}>
            <FormControl
              name="confirm_password"
              control={control}
              label="Xác nhận mật khẩu"
              error={errors.confirm_password?.message}
              required
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="••••••••" 
              />
            </FormControl>
          </Col>
        </Row>

        <Form.Item className="mb-8">
          <Checkbox>
            Tôi đồng ý với <a href="#" className="text-primary-600 font-semibold hover:underline">Điều khoản bảo mật</a>.
          </Checkbox>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button 
            type="primary" 
            htmlType="submit" 
            fullWidth
            size="large"
            loading={loading}
          >
            Đăng ký tài khoản
          </Button>
        </Form.Item>
      </Form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center">
          <ArrowLeftOutlined className="mr-1 text-xs" /> Quay lại đăng nhập
        </Link>
      </p>
    </Card>
  );
};

export default Register;
