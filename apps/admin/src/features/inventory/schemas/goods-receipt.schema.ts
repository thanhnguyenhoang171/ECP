import { z } from 'zod';

export const goodsReceiptItemSchema = z.object({
  skuId: z.string().min(1, 'Vui lòng chọn SKU'),
  skuName: z.string().optional(), // For UI display
  batchCode: z.string().optional(),
  manufactureDate: z.string().optional(),
  expiryDate: z.string().optional(),
  quantity: z.number().min(1, 'Số lượng phải ít nhất là 1'),
  unitCost: z.number().min(0, 'Đơn giá không được âm'),
});

export const goodsReceiptSchema = z.object({
  receiptCode: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  warehouseId: z.string().min(1, 'Vui lòng chọn kho nhập'),
  note: z.string().optional(),
  items: z.array(goodsReceiptItemSchema).min(1, 'Vui lòng thêm ít nhất một sản phẩm'),
});

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;
export type GoodsReceiptItemFormValues = z.infer<typeof goodsReceiptItemSchema>;
