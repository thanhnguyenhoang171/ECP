import { z } from 'zod';

export const warehouseSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Tên kho là bắt buộc'),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
