import * as z from "zod";

export const productAttributeSchema = z.object({
  key: z.string().min(1, "Tên thuộc tính không được để trống"),
  value: z.string().min(1, "Giá trị không được để trống"),
});

export const productSpecificationSchema = z.object({
  key: z.string().min(1, "Tên thông số không được để trống"),
  value: z.string().min(1, "Giá trị không được để trống"),
});

export const productVariantSchema = z.object({
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  barcodeType: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  stock: z.coerce.number().min(0, "Tồn kho phải lớn hơn hoặc bằng 0").default(0),
  compareAtPrice: z.coerce.number().min(0, "Giá so sánh phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  costPrice: z.coerce.number().min(0, "Giá vốn phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  attributes: z.array(productAttributeSchema).default([]),
  image: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  sku: z.string().optional().or(z.literal("")),
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  slug: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional().or(z.literal("")),
  thumbnail: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  specifications: z.array(productSpecificationSchema).default([]),
  variants: z.array(productVariantSchema).min(1, "Phải có ít nhất một biến thể"),
  isPublished: z.boolean().default(true),
  weight: z.coerce.number().min(0, "Khối lượng phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  length: z.coerce.number().min(0, "Chiều dài phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  width: z.coerce.number().min(0, "Chiều rộng phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  height: z.coerce.number().min(0, "Chiều cao phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  tags: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
  metaKeywords: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
export type ProductAttributeValues = z.infer<typeof productAttributeSchema>;
export type ProductSpecificationValues = z.infer<typeof productSpecificationSchema>;

