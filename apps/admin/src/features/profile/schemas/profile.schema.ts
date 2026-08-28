import * as z from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().trim().email("Email không hợp lệ"),
  phone: z.string().trim().optional().or(z.literal('')),
  role: z.string(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
