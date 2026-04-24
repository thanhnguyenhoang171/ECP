import React, { useState } from 'react';
import Form from 'antd/es/form';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import AntdAvatar from 'antd/es/avatar';
import Upload from 'antd/es/upload';
import message from 'antd/es/message';
import Typography from 'antd/es/typography';
import Divider from 'antd/es/divider';
import Image from 'antd/es/image';
import Tooltip from 'antd/es/tooltip';
import type { GetProp } from 'antd';
import type { UploadProps } from 'antd/es/upload';
import UserOutlined from '@ant-design/icons/es/icons/UserOutlined';
import MailOutlined from '@ant-design/icons/es/icons/MailOutlined';
import PhoneOutlined from '@ant-design/icons/es/icons/PhoneOutlined';
import CameraOutlined from '@ant-design/icons/es/icons/CameraOutlined';
import SaveOutlined from '@ant-design/icons/es/icons/SaveOutlined';
import KeyOutlined from '@ant-design/icons/es/icons/KeyOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/es/icons/SafetyCertificateOutlined';
import EyeOutlined from '@ant-design/icons/es/icons/EyeOutlined';
import CheckCircleFilled from '@ant-design/icons/es/icons/CheckCircleFilled';
import { Card, Input, Button, FormControl } from '../../components/common';
import { useForm } from 'react-hook-form';

const { Title, Text } = Typography;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@ecp.vn',
      phone_number: '0987654321',
      username: 'admin',
    },
  });

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as FileType).then((url) => {
        setLoading(false);
        setAvatarUrl(url);
        message.success('Cập nhật ảnh đại diện thành công!');
      });
    }
  };

  const onUpdateProfile = (data: ProfileFormData) => {
    console.log('Update profile:', data);
    message.success('Cập nhật thông tin cá nhân thành công!');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Row gutter={[24, 24]}>
        {/* Left Column: Avatar & Quick Info */}
        <Col xs={24} md={8}>
          <Card className="text-center h-full overflow-hidden">
            <div className="mb-8 relative inline-block group">
              {/* Avatar Container */}
              <div className="relative w-[150px] h-[150px] rounded-full ring-4 ring-white shadow-soft overflow-hidden cursor-pointer group-hover:ring-primary-100 transition-all duration-300 mx-auto">
                <AntdAvatar 
                  size={150} 
                  src={avatarUrl}
                  icon={<UserOutlined />} 
                  className={`bg-slate-100 text-slate-300 transition-all duration-500 ${loading ? 'opacity-40' : 'opacity-100'}`}
                />
                
                {/* Smart Unified Overlay */}
                <Upload
                  name="avatar"
                  showUploadList={false}
                  action="https://660d2bd96ddfa4504824873b.mockapi.io/api/upload"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full block"
                >
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white">
                    <CameraOutlined className="text-2xl mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cập nhật ảnh</span>
                  </div>
                </Upload>
              </div>
              
              {/* Quick Actions Badge - Triggers Native Image Preview */}
              {avatarUrl && (
                <Tooltip title="Xem ảnh chân dung">
                  <div 
                    onClick={() => {
                      setPreviewImage(avatarUrl);
                      setPreviewOpen(true);
                    }}
                    className="absolute top-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 cursor-pointer z-20 border border-slate-100 transition-all active:scale-90"
                  >
                    <EyeOutlined className="text-sm" />
                  </div>
                </Tooltip>
              )}

              {/* Status Indicator */}
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md z-10 border-2 border-white">
                <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div className="px-4">
              <Title level={4} className="mb-1 m-0 text-slate-800">Admin User</Title>
              <div className="flex items-center justify-center gap-1 mb-6">
                <Text className="uppercase text-[10px] font-bold tracking-widest text-primary-600">Quản trị viên</Text>
                <CheckCircleFilled className="text-primary-500 text-[10px]" />
              </div>
            </div>
            
            <Divider className="my-6 border-slate-100" />
            
            <div className="space-y-4 text-left px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <SafetyCertificateOutlined className="text-lg" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Bảo mật tài khoản</div>
                  <div className="text-sm font-semibold text-emerald-600">Đã bảo vệ</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <KeyOutlined className="text-lg" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Phiên đăng nhập</div>
                  <div className="text-sm font-semibold text-slate-800">Hoạt động</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column: Detailed Info */}
        <Col xs={24} md={16}>
          <Card title={<span className="text-base font-bold text-slate-800 flex items-center gap-2"><UserOutlined className="text-primary-600" /> Thông tin tài khoản</span>}>
            <Form layout="vertical" onFinish={handleSubmit(onUpdateProfile)} requiredMark={false}>
              <Row gutter={16}>
                <Col span={12}>
                  <FormControl name="first_name" control={control} label="Họ & Tên đệm" error={errors.first_name?.message} required>
                    <Input placeholder="Nhập họ" />
                  </FormControl>
                </Col>
                <Col span={12}>
                  <FormControl name="last_name" control={control} label="Tên" error={errors.last_name?.message} required>
                    <Input placeholder="Nhập tên" />
                  </FormControl>
                </Col>
              </Row>

              <FormControl name="email" control={control} label="Địa chỉ Email" error={errors.email?.message} required>
                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
              </FormControl>

              <Row gutter={16}>
                <Col span={12}>
                  <FormControl name="phone_number" control={control} label="Số điện thoại" error={errors.phone_number?.message} required>
                    <Input prefix={<PhoneOutlined />} placeholder="0123 456 789" />
                  </FormControl>
                </Col>
                <Col span={12}>
                  <FormControl name="username" control={control} label="Tên đăng nhập" error={errors.username?.message} required>
                    <Input placeholder="username" disabled />
                  </FormControl>
                </Col>
              </Row>

              <div className="flex justify-end mt-4">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </Card>

          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold mb-1 flex items-center gap-2"><KeyOutlined className="text-amber-500" /> Bảo mật & Mật khẩu</h4>
                <p className="text-xs text-slate-500 m-0">Bạn nên thay đổi mật khẩu định kỳ để bảo vệ tài khoản.</p>
              </div>
              <Button>
                Đổi mật khẩu
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Hidden Ant Design Image for Professional Preview */}
      {previewImage && (
        <Image
          style={{ display: 'none' }}
          preview={{
            open: previewOpen,
            onOpenChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
};

export default Profile;
