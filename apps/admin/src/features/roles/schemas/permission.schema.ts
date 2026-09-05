import * as z from 'zod';

export const permissionSchema = z.object({
  code: z
    .string()
    .min(2, 'Mã quyền hạn tối thiểu 2 ký tự')
    .max(100, 'Mã quyền hạn tối đa 100 ký tự')
    .regex(
      /^[a-z0-9_:-]+$/,
      'Mã quyền hạn chỉ được chứa chữ thường, số, dấu hai chấm, gạch ngang và gạch dưới (ví dụ: user:read)'
    ),
  name: z
    .string()
    .min(2, 'Tên quyền hạn tối thiểu 2 ký tự')
    .max(100, 'Tên quyền hạn tối đa 100 ký tự'),
  module: z
    .string()
    .min(2, 'Nhóm module tối thiểu 2 ký tự')
    .max(50, 'Nhóm module tối đa 50 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Nhóm module chỉ gồm chữ in hoa, số và gạch dưới (ví dụ: USER, PRODUCT)'),
  description: z
    .string()
    .max(255, 'Mô tả tối đa 255 ký tự')
    .optional()
    .or(z.literal('')),
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;
