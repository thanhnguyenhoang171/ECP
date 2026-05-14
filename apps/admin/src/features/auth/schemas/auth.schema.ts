import * as z from "zod";

const noAccentRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;
const noAccentMessage = "Không được phép chứa dấu hoặc ký tự đặc biệt không hợp lệ.";

export const loginSchema = z.object({
  username: z.string().trim()
    .min(2, { message: "Tên đăng nhập phải có ít nhất 2 ký tự." })
    .regex(noAccentRegex, { message: noAccentMessage }),
  password: z.string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." })
    .regex(noAccentRegex, { message: noAccentMessage }),
  remember: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().trim()
    .min(2, { message: "Tên người dùng phải có ít nhất 2 ký tự." })
    .regex(noAccentRegex, { message: noAccentMessage }),
  email: z.string().trim().email({
    message: "Email không hợp lệ.",
  }),
  firstName: z.string().trim().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  lastName: z.string().trim().min(2, {
    message: "Họ phải có ít nhất 2 ký tự.",
  }),
  password: z.string()
    .min(6, { message: "Mật khẩu phải từ 6 ký tự trở lên." })
    .regex(noAccentRegex, { message: noAccentMessage }),
  confirm: z.string(),
})
.refine((data) => data.password === data.confirm, {
  message: "Mật khẩu xác nhận không khớp.",
  path: ["confirm"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
