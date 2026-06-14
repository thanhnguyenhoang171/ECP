import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(2, 'Tên thương hiệu phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự'),
  logoUrl: z.string().url('Logo URL không hợp lệ').optional().or(z.literal('')),
  description: z.string().optional(),
  website: z.string().url('Website URL không hợp lệ').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
