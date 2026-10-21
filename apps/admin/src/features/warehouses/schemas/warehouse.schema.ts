import { z } from 'zod';

export const warehouseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Tên kho là bắt buộc'),
  address: z.string().optional(),
  managerEmail: z.string().email('Email người quản lý không hợp lệ').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
