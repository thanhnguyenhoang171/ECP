import { type FC } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import Select from 'antd/es/select';
import Upload from 'antd/es/upload';
import PlusOutlined from '@ant-design/icons/es/icons/PlusOutlined';
import type {Product} from "../../../interfaces";

interface ProductFormProps {
  form: any;
  initialValues?: Partial<Product>;
}

const ProductForm: FC<ProductFormProps> = ({ form, initialValues }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      name="productForm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          className="col-span-2"
        >
          <Input placeholder="Ví dụ: iPhone 15 Pro Max" />
        </Form.Item>

        <Form.Item
          name="sku"
          label="Mã SKU"
        >
          <Input placeholder="IP15PM-256-BLU" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
        >
          <Select placeholder="Chọn danh mục">
            <Select.Option value="Điện thoại">Điện thoại</Select.Option>
            <Select.Option value="Laptop">Laptop</Select.Option>
            <Select.Option value="Phụ kiện">Phụ kiện</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá bán"
          rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
        >
          <InputNumber
            className="w-full"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
            addonAfter="VND"
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Số lượng kho"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber className="w-full" min={0} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          initialValue="active"
        >
          <Select>
            <Select.Option value="active">Đang bán</Select.Option>
            <Select.Option value="out_of_stock">Hết hàng</Select.Option>
            <Select.Option value="disabled">Ngừng kinh doanh</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="image"
          label="Hình ảnh"
          className="col-span-2"
        >
          <Upload listType="picture-card" maxCount={1}>
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Tải lên</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          className="col-span-2"
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả sản method..." />
        </Form.Item>
      </div>
    </Form>
  );
};

export default ProductForm;
