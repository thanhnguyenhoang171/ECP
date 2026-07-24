import { z } from 'zod';

export const purchaseOrderItemSchema = z.object({
  skuId: z.string().min(1, 'Vui lòng chọn sản phẩm (SKU)'),
  skuName: z.string().optional(),
  orderedQuantity: z.number().min(1, 'Số lượng đặt mua tối thiểu là 1'),
  unitPrice: z.number().min(0, 'Đơn giá không được âm'),
  note: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  code: z.string().optional(),
  supplierId: z.string().min(1, 'Vui lòng chọn Nhà cung cấp'),
  warehouseId: z.string().min(1, 'Vui lòng chọn Kho dự kiến nhận'),
  expectedDeliveryDate: z.string().optional(),
  note: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'Vui lòng thêm ít nhất một sản phẩm'),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItemFormValues = z.infer<typeof purchaseOrderItemSchema>;
