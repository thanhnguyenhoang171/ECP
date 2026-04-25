import * as z from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  role: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
