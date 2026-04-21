import { type FC } from 'react';
import { Space, Dropdown } from 'antd';
import { EllipsisOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Card, Tag, Avatar, Button } from '../../../components/common';
import type {Product, ProductStatus} from "../../../interfaces";

interface ProductMobileCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string | number) => void;
}

const statusMap: Record<ProductStatus, { label: string; color: string }> = {
  active: { label: 'Đang bán', color: 'success' },
  out_of_stock: { label: 'Hết hàng', color: 'error' },
  disabled: { label: 'Ngừng kinh doanh', color: 'default' },
};

const ProductMobileCard: FC<ProductMobileCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <Space size="middle">
          <Avatar 
            src={product.image} 
            shape="square" 
            size={56} 
            icon={<ShoppingOutlined />} 
            className="bg-slate-50 border border-slate-100 flex-shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 leading-tight text-base">{product.name}</span>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{product.sku || 'N/A'}</span>
            <span className="text-sm text-slate-500 mt-0.5">{product.category}</span>
          </div>
        </Space>
        
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Xem', icon: <EyeOutlined /> },
              { key: 'edit', label: 'Sửa', icon: <EditOutlined />, onClick: () => onEdit(product) },
              { type: 'divider' },
              { key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true, onClick: () => onDelete(product.id) },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined />} className="-mr-2" />
        </Dropdown>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
        <div>
          <div className="text-xs text-slate-400 mb-1 uppercase tracking-tighter">Giá bán</div>
          <div className="font-bold text-slate-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1 uppercase tracking-tighter">Kho / Trạng thái</div>
          <Space size="small">
            <span className={product.stock < 10 ? 'text-rose-600 font-bold' : 'text-slate-600 font-medium'}>
              SL: {product.stock}
            </span>
            <Tag color={statusMap[product.status].color} className="m-0">
              {statusMap[product.status].label}
            </Tag>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default ProductMobileCard;
