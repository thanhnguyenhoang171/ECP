'use server';

import { revalidatePath } from 'next/cache';
import { CategoryFormValues } from '../schemas/category.schema';

export async function createCategoryAction(values: CategoryFormValues) {
  try {
    const payload = { ...values };
    if (
      !payload.parentId ||
      payload.parentId === '' ||
      payload.parentId === 'none'
    ) {
      delete payload.parentId;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Failed to create category');
    }

    // 🔥 ĐÂY LÀ CHỖ QUAN TRỌNG: Làm mới cache
    revalidatePath('/categories');

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${id}`,
      {
        method: 'DELETE',
      },
    );

    console.log(res);

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Không thể xóa danh mục này');
    }

    revalidatePath('/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
