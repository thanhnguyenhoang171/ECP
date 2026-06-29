import { z } from 'zod';

export const promotionSchema = z.object({
  code: z.string().min(3, 'Mã giảm giá phải từ 3 ký tự trở lên').toUpperCase(),
  name: z.string().min(5, 'Tên chương trình phải từ 5 ký tự trở lên'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().min(0, 'Giá trị không được âm'),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'SCHEDULED', 'DISABLED']).default('ACTIVE'),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;
