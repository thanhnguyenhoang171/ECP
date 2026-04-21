import { type FC } from 'react';
import { Card } from '../../components/common';
import { ScanOutlined } from '@ant-design/icons';

const BarcodeScans: FC = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanOutlined className="text-primary-500 text-xl" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hệ thống Quét Mã Vạch</h1>
          </div>
          <p className="text-slate-500 font-medium">Trang trống chờ cập nhật</p>
        </div>
      </div>
      
      <Card className="min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-slate-200">
        <ScanOutlined className="text-6xl text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium text-lg">Chức năng quét mã vạch đã được gỡ bỏ.</p>
      </Card>
    </div>
  );
};

export default BarcodeScans;
