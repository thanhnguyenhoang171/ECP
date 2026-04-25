import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().min(2, {
    message: "Tên đăng nhập phải có ít nhất 2 ký tự.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
  remember: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(2, {
    message: "Tên người dùng phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải từ 6 ký tự trở lên.",
  }),
  confirm: z.string(),
  agreement: z.boolean().refine(v => v === true, {
    message: "Bạn phải đồng ý với điều khoản dịch vụ.",
  }),
}).refine((data) => data.password === data.confirm, {
  message: "Mật khẩu xác nhận không khớp.",
  path: ["confirm"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
