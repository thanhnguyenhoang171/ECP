'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { CategoryFormValues } from '../schemas/category.schema';
import { categoryApi } from '../api/category.api';

export async function createCategoryAction(values: CategoryFormValues) {
  try {
    const payload: Partial<CategoryFormValues> = { ...values };

    if (
      !payload.parentId ||
      payload.parentId === '' ||
      payload.parentId === 'none'
    ) {
      delete payload.parentId;
    }

    const result = await categoryApi.create(payload as CategoryFormValues);

    revalidateTag('categories-list', 'default');

    revalidateTag('categories-parents', 'default');
    revalidatePath('/categories');
    return { success: true, data: result.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}

export async function updateCategoryAction(
  id: string,
  values: CategoryFormValues,
) {
  try {
    const payload: Record<string, unknown> = { ...values };

    if (
      !payload.parentId ||
      payload.parentId === '' ||
      payload.parentId === 'none'
    ) {
      payload.parentId = null; // Dùng null thay vì ""
    }

    // Map active to isActive if API requires it
    if (payload.active !== undefined) {
      payload.isActive = payload.active;
    }

    const result = await categoryApi.update(id, payload);

    revalidateTag('categories-list', 'default');

    revalidateTag('categories-parents', 'default');
    revalidatePath('/categories');
    return { success: true, data: result.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await categoryApi.delete(id);

    revalidateTag('categories-list', 'default');

    revalidateTag('categories-parents', 'default');
    revalidatePath('/categories');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message };
  }
}
