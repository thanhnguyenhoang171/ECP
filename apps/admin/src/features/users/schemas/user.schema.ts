import * as z from "zod";

export const userSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ (ví dụ: 0912345678)"),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'USER'], {
    required_error: "Vui lòng chọn vai trò",
  }),
  status: z.enum(['active', 'inactive']).default('active'),
  password: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  avatarPublicId: z.string().optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userSchema>;
