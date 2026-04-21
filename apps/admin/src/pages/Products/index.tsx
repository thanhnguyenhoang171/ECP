import { type FC, useState, useMemo } from 'react';
import { Space, Dropdown, message, Modal, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  DataTable, 
  Button, 
  Tag, 
  Breadcrumb,
  Avatar,
  Card
} from '../../components/common';
import { useProducts } from '../../hooks/useProducts';

// Import các component con
import ProductStats from './components/ProductStats';
import ProductModal from './components/ProductModal';
import ProductMobileCard from './components/ProductMobileCard';
import type {Product, ProductStatus} from "../../interfaces";

const Products: FC = () => {
  const { data, isLoading, refetch } = useProducts();
  const [searchText, setSearchText] = useState('');
  
  // Responsive check (Giả lập đơn giản, có thể dùng hook useBreakpoint của antd)
  const isMobile = window.innerWidth < 768;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const statusMap: Record<ProductStatus, { label: string; color: string }> = useMemo(() => ({
    active: { label: 'Đang bán', color: 'success' },
    out_of_stock: { label: 'Hết hàng', color: 'error' },
    disabled: { label: 'Ngừng kinh doanh', color: 'default' },
  }), []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    console.log("Delete Id = ", id);
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        message.success('Xóa sản phẩm thành công');
        refetch();
      }
    });
  };

  const filteredData = useMemo(() => {
    return data?.content.filter(product => 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];
  }, [data, searchText]);

  const columns: ColumnsType<Product> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            src={record.image} 
            shape="square" 
            size={48} 
            icon={<ShoppingOutlined />} 
            className="bg-slate-50 border border-slate-100"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 leading-tight">{record.name}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{record.sku || 'N/A'}</span>
          </div>
        </Space>
      ),
    },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="font-medium text-slate-900">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
        </span>
      ),
    },
    {
      title: 'Kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <span className={stock < 10 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{stock}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProductStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].label}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Xem', icon: <EyeOutlined /> },
              { key: 'edit', label: 'Sửa', icon: <EditOutlined />, onClick: () => handleEdit(record) },
              { type: 'divider' },
              { key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record.id) },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Sản phẩm' }]} className="mb-2" />
          <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleAdd} className="w-full sm:w-auto">
          Thêm sản phẩm
        </Button>
      </div>

      <ProductStats data={data?.content} totalElements={data?.totalElements} />

      {isMobile ? (
        <div className="space-y-4">
          <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm py-2">
             <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined className="text-slate-400" />}
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
                className="shadow-sm"
              />
          </div>
          {isLoading ? (
            <Card loading={true} className="h-32" />
          ) : (
            filteredData.map(product => (
              <ProductMobileCard 
                key={product.id} 
                product={product} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          total={data?.totalElements}
          onSearch={setSearchText}
          onRefresh={() => refetch()}
        />
      )}

      <ProductModal 
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={async () => {
          setSubmitLoading(true);
          await new Promise(r => setTimeout(r, 500));
          message.success('Thao tác thành công');
          setModalOpen(false);
          setSubmitLoading(false);
          refetch();
        }}
        initialValues={editingProduct}
        loading={submitLoading}
      />
    </div>
  );
};

export default Products;
