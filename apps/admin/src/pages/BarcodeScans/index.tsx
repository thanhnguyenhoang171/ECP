import { type FC } from 'react';
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
  AlertOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const BarcodeScans: FC = () => {
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
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ThunderboltOutlined className="text-amber-500 text-xl" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hệ thống Quét AI</h1>
          </div>
          <p className="text-slate-500 font-medium">Nhận diện sản phẩm bằng mô hình YOLOv8 qua Web Worker</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider">AI Engine Active</span>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: AI Scanner */}
        <Col xs={24} lg={10} xl={9}>
          <div className="sticky top-6">
            <Card 
              className="overflow-hidden border-none shadow-xl shadow-slate-200/50" 
              bodyStyle={{ padding: 0 }}
            >
              <BarcodeScanner />
            </Card>

            <Card className="mt-6 bg-slate-900 border-none shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                  <AlertOutlined className="text-primary-400 text-xl" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1 text-sm">Hướng dẫn vận hành</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Đưa mã vạch vào vùng khung nhắm xanh. Giữ yên thiết bị để AI tự động lấy nét và nhận diện mã.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Col>

        {/* Right Column: Analytics & History */}
        <Col xs={24} lg={14} xl={15}>
          <Space orientation="vertical" size={24} className="w-full">
            {/* Statistics Row */}
            <Row gutter={[20, 20]}>
              <Col span={24} sm={12}>
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <Statistic 
                    title={<span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Lượt quét hôm nay</span>}
                    value={1248}
                    prefix={<ScanOutlined className="text-primary-500 mr-2" />}
                    styles={{ content: { fontSize: 32, fontWeight: 800 } }}
                  />
                  <div className="mt-3 flex items-center text-emerald-600 text-xs font-bold">
                    <CheckCircleOutlined className="mr-1" />
                    <span>Tăng 12% so với hôm qua</span>
                  </div>
                </Card>
              </Col>
              <Col span={24} sm={12}>
                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <Statistic 
                    title={<span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Độ chính xác AI</span>}
                    value={98.4}
                    suffix="%"
                    prefix={<ThunderboltOutlined className="text-amber-500 mr-2" />}
                    styles={{ content: { fontSize: 32, fontWeight: 800 } }}
                  />
                  <div className="mt-3 flex items-center text-slate-400 text-xs">
                    <span>Dựa trên 5.2k lượt mẫu</span>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Recent Scans Table */}
            <Card 
              title={
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2 text-slate-800 font-bold">
                    <HistoryOutlined className="text-primary-600" /> 
                    Nhật ký quét thời gian thực
                  </span>
                  <Tag color="blue" className="rounded-full border-none px-3 py-0.5 text-[10px] font-bold">LIVE</Tag>
                </div>
              }
              className="border-slate-100 shadow-sm"
            >
              <Table 
                dataSource={recentScans} 
                columns={columns} 
                pagination={false}
                className="custom-scanner-table"
              />
            </Card>

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] font-bold text-slate-600">Model: YOLOv8-N</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[11px] font-bold text-slate-600">Runtime: Web Worker</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[11px] font-bold text-slate-600">Backend: WASM SIMD</span>
              </div>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default BarcodeScans;
