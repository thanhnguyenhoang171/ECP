import React from 'react';
import { Button, Result } from 'antd';
import { useRouteError, useNavigate } from 'react-router-dom';

const GeneralError: React.FC = () => {
  const error = useRouteError() as { statusText?: string; message?: string };
  const navigate = useNavigate();
  console.error(error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Result
        status="500"
        title="Đã có lỗi xảy ra"
        subTitle={error?.statusText || error?.message || "Hệ thống đang gặp sự cố tạm thời, vui lòng thử lại sau."}
        extra={
          <div className="space-x-4">
            <Button type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              Quay lại trang chủ
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default GeneralError;