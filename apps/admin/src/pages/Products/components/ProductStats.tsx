import { type FC } from 'react';
import { ShoppingOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Statistic } from '../../../components/common';
import type {Product} from "../../../interfaces";

interface ProductStatsProps {
  data?: Product[];
  totalElements?: number;
}

const ProductStats: FC<ProductStatsProps> = ({ data = [], totalElements = 0 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <Statistic 
          title="Tổng sản phẩm" 
          value={totalElements} 
          prefix={<ShoppingOutlined className="text-blue-500 mr-2" />} 
        />
      </Card>
      <Card>
        <Statistic 
          title="Hết hàng" 
          value={data.filter(p => p.status === 'out_of_stock').length} 
          prefix={<InboxOutlined className="text-rose-500 mr-2" />} 
        />
      </Card>
      <Card>
        <Statistic 
          title="Đang kinh doanh" 
          value={data.filter(p => p.status === 'active').length} 
          prefix={<CheckCircleOutlined className="text-emerald-500 mr-2" />} 
        />
      </Card>
    </div>
  );
};

export default ProductStats;
