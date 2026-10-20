import * as z from "zod";

const productImageSchema = z.union([
  z.string(),
  z.object({ url: z.string(), publicId: z.string().optional() }),
  z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File, {
    message: 'Vui lòng chọn tệp ảnh hợp lệ',
  }),
]);

export const productAttributeSchema = z.object({
  key: z.string().min(1, "Tên thuộc tính không được để trống"),
  value: z.string().min(1, "Giá trị không được để trống"),
});

export const productSpecificationSchema = z.object({
  key: z.string().min(1, "Tên thông số không được để trống"),
  value: z.string().min(1, "Giá trị không được để trống"),
});

export const productVariantSchema = z.object({
  skuId: z.string().optional(),
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  barcodeType: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  compareAtPrice: z.coerce.number().min(0, "Giá so sánh phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  costPrice: z.coerce.number().min(0, "Giá vốn phải lớn hơn hoặc bằng 0").optional().or(z.literal(0)),
  attributes: z.array(productAttributeSchema).default([]),
  image: productImageSchema.optional(),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  sku: z.string().optional().or(z.literal("")),
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  slug: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().optional().or(z.literal("")),
  thumbnail: productImageSchema.optional(),
  images: z.array(productImageSchema).default([]),
  specifications: z.array(productSpecificationSchema).default([]),
  variants: z.array(productVariantSchema).min(1, "Phải có ít nhất một biến thể"),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  viewCount: z.coerce.number().int("Giá trị phải là số nguyên").min(0, "Giá trị không được âm").max(2147483647, "Giá trị quá lớn").default(0),
  soldCount: z.coerce.number().int("Giá trị phải là số nguyên").min(0, "Giá trị không được âm").max(2147483647, "Giá trị quá lớn").default(0),
  ratingAvg: z.coerce.number().min(0, "Điểm đánh giá phải từ 0 đến 5").max(5, "Điểm đánh giá phải từ 0 đến 5").default(0),
  ratingCount: z.coerce.number().int("Giá trị phải là số nguyên").min(0, "Giá trị không được âm").max(2147483647, "Giá trị quá lớn").default(0),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
  metaKeywords: z.string().optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
export type ProductAttributeValues = z.infer<typeof productAttributeSchema>;
export type ProductSpecificationValues = z.infer<typeof productSpecificationSchema>;

