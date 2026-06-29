import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z.string().optional().or(z.literal("")),
  parentId: z.string().optional(),
  active: z.boolean().default(true),
  imageUrl: z.any().optional(),
  imagePublicId: z.string().optional(),
  description: z.string().optional().or(z.literal("")),
  order: z.coerce.number().min(0, "Thứ tự hiển thị không thể âm").default(0),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
  metaKeywords: z.string().optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;


