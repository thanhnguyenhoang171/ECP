'use server';

import { revalidatePath } from 'next/cache';
import { CategoryFormValues } from '../schemas/category.schema';
import { categoryApi } from '../api/category.api';

export async function createCategoryAction(values: CategoryFormValues) {
  try {
    const payload: any = { ...values };
    
    if (!payload.parentId || payload.parentId === '' || payload.parentId === 'none') {
      delete payload.parentId;
    }

    const result = await categoryApi.create(payload);
    
    revalidatePath('/categories');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateCategoryAction(id: string, values: CategoryFormValues) {
  try {
    const payload: any = { ...values };
    
    if (!payload.parentId || payload.parentId === '' || payload.parentId === 'none') {
      payload.parentId = "";
    }

    // Map active to isActive if API requires it
    if (payload.active !== undefined) {
      payload.isActive = payload.active;
    }

    const result = await categoryApi.update(id, payload);

    revalidatePath('/categories');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await categoryApi.delete(id);
    
    revalidatePath('/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
