import * as z from 'zod';

export const brandSchema = z.object({
  name: z.string().min(1, 'Tên thương hiệu không được để trống'),
  slug: z.string().optional().or(z.literal('')),
  logo: z.union([
    z.string(),
    z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File),
  ]).nullable().optional(),
  description: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
