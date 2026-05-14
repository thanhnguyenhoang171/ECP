import * as z from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z.string().trim().min(10, "Số điện thoại không hợp lệ"),
  role: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
