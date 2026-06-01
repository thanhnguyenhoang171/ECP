import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(1, 'Tên nhà cung cấp là bắt buộc'),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().optional(),
  taxCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
