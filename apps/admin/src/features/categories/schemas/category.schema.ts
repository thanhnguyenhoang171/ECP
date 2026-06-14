import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z.string().optional().or(z.literal("")),
  parentId: z.string().optional(),
  active: z.boolean().default(true),
  thumbnail: z.any().optional(),
  description: z.string().optional().or(z.literal("")),
  displayOrder: z.coerce.number().min(0, "Thứ tự hiển thị không thể âm").default(0),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
  metaKeywords: z.string().optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

