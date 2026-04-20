import React from 'react';
import { Row, Col, Space } from 'antd';
import { 
  BarcodeScanner, 
  Card, 
  Statistic, 
  Table, 
  Tag 
} from '../../components/common';
import { 
  HistoryOutlined, 
  CheckCircleOutlined, 
  ScanOutlined,
  AlertOutlined 
} from '@ant-design/icons';

const BarcodeScans: React.FC = () => {
  const recentScans = [
    {
      key: '1',
      barcode: '8934563128904',
      product: 'Sữa tươi Vinamilk 180ml',
      status: 'success',
      time: '10:25:30',
    },
    {
      key: '2',
      barcode: '8931234567890',
      product: 'Bánh snack Oishi 40g',
      status: 'success',
      time: '10:20:15',
    },
    {
      key: '3',
      barcode: '8939998887776',
      product: 'Nước khoáng La Vie 500ml',
      status: 'error',
      time: '10:15:05',
    },
  ];

  const columns = [
    {
      title: 'Mã vạch',
      dataIndex: 'barcode',
      key: 'barcode',
      render: (text: string) => <code className="bg-slate-50 px-2 py-1 rounded text-primary-600 font-bold">{text}</code>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (text: string) => <span className="font-medium text-slate-700">{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? 'Thành công' : 'Thất bại'}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (text: string) => <span className="text-slate-400 text-xs">{text}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quét mã vạch</h1>
          <p className="text-slate-500">Sử dụng AI YOLO để nhận diện sản phẩm qua camera</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider">Hệ thống đang hoạt động</span>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left: Scanner area */}
        <Col xs={24} lg={14}>
          <BarcodeScanner />
          
          <Card className="mt-6" title={<span className="flex items-center gap-2 text-slate-800"><HistoryOutlined className="text-primary-600" /> Nhật ký quét gần đây</span>}>
            <Table 
              dataSource={recentScans} 
              columns={columns} 
              pagination={false}
              className="mt-2"
            />
          </Card>
        </Col>

        {/* Right: Statistics & Info */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={24} className="w-full">
            <Card className="bg-primary-600 border-none shadow-primary-100">
              <Statistic 
                title={<span className="text-primary-100 font-medium">Tổng số lượt quét hôm nay</span>}
                value={1248}
                valueStyle={{ color: '#fff', fontSize: 32 }}
                prefix={<ScanOutlined className="text-primary-200 mr-2" />}
              />
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-white/80 text-xs">
                <span>Tăng 12% so với hôm qua</span>
                <CheckCircleOutlined />
              </div>
            </Card>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card className="text-center py-6">
                  <Statistic 
                    title="Thành công" 
                    value={1205} 
                    valueStyle={{ color: '#10b981' }} 
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="text-center py-6">
                  <Statistic 
                    title="Lỗi nhận diện" 
                    value={43} 
                    valueStyle={{ color: '#ef4444' }} 
                  />
                </Card>
              </Col>
            </Row>

            <Card title={<span className="text-slate-800 font-bold flex items-center gap-2"><AlertOutlined className="text-warning" /> Hướng dẫn vận hành</span>}>
              <ul className="space-y-4 m-0 p-0 list-none">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">1</div>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">Đảm bảo mã vạch nằm trong khung xanh nhận diện.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">2</div>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">Giữ camera ổn định trong khoảng 1-2 giây để AI xử lý.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">3</div>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">Nếu không nhận diện được, hãy kiểm tra độ sáng môi trường.</p>
                </li>
              </ul>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default BarcodeScans;
