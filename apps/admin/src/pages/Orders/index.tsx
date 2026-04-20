import { type FC } from 'react';

const Orders: FC = () => {
  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Đơn hàng</h1>
      <p>Quản lý đơn hàng dựa trên PostgreSQL Orders table.</p>
    </div>
  );
};

export default Orders;
