import * as z from "zod";
import { imageValueSchema } from '@/lib/image-value';

export const userSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(100, "Họ và tên tối đa 100 ký tự"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z.string().trim().regex(/^$|^0[35789][0-9]{8}$/, "Số điện thoại không hợp lệ (ví dụ: 0912345678)"),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'USER'], {
    required_error: "Vui lòng chọn vai trò",
  }),
  status: z.enum(['active', 'inactive']).default('active'),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự").optional().or(z.literal("")),
  avatarUrl: imageValueSchema,
  avatarPublicId: z.string().optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(72, 'Mật khẩu tối đa 72 ký tự'),
});
