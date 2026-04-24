import { type FC } from 'react';
import Modal from 'antd/es/modal';
import Form from 'antd/es/form';
import ProductForm from './ProductForm';
import type {Product} from "../../../interfaces";

interface ProductModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (values: any) => void;
  initialValues?: Product | null;
  loading?: boolean;
}

const ProductModal: FC<ProductModalProps> = ({ 
  open, 
  onCancel, 
  onSuccess, 
  initialValues,
  loading 
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSuccess(values);
      form.resetFields();
    } catch (error) {
      console.error('Validate failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      confirmLoading={loading}
      width={700}
      okText={initialValues ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      centered
      destroyOnClose
    >
      <div className="py-4">
        <ProductForm form={form} initialValues={initialValues || {}} />
      </div>
    </Modal>
  );
};

export default ProductModal;
