import * as z from 'zod';

export const roleSchema = z.object({
  code: z
    .string()
    .min(2, 'Mã vai trò tối thiểu 2 ký tự')
    .max(50, 'Mã vai trò tối đa 50 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Mã vai trò chỉ được chứa chữ hoa, số và dấu gạch dưới'),
  name: z.string().min(2, 'Tên vai trò tối thiểu 2 ký tự').max(100, 'Tên vai trò tối đa 100 ký tự'),
  description: z.string().max(255, 'Mô tả tối đa 255 ký tự').optional().or(z.literal('')),
  permissionCodes: z.array(z.string()).default([]),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
