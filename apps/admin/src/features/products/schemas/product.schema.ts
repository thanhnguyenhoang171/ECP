import * as z from "zod";

export const productVariantSchema = z.object({
  sku: z.string().min(2, "SKU biến thể không được để trống"),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  stock: z.number().min(0, "Số lượng tồn kho không được âm"),
  attributes: z.record(z.string(), z.string()).default({}),
});

export const productSchema = z.object({
  sku: z.string().min(2, "Mã sản phẩm (SKU) không được để trống"),
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  brand: z.string().min(1, "Vui lòng nhập thương hiệu"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional(),
  variants: z.array(productVariantSchema).min(1, "Phải có ít nhất một biến thể"),
  isPublished: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
