import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  parentId: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
