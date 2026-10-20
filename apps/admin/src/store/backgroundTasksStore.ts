'use client';

import { create } from 'zustand';

import { fileApi } from '@/features/files/api/file.api';
import { createBackgroundTaskQueue, type BackgroundTask } from '@/lib/background-task-queue';

interface BackgroundTasksState {
  readonly tasks: readonly BackgroundTask[];
}

export const useBackgroundTasksStore = create<BackgroundTasksState>(() => ({ tasks: [] }));

export const backgroundTasks = createBackgroundTaskQueue({
  changed: (tasks) => useBackgroundTasksStore.setState({ tasks }),
  upload: async (file, folder, signal) => {
    const result = await fileApi.uploadFile(file, folder, { signal, skipToast: true });
    const url = result.data?.secure_url || result.data?.url;
    if (!result.success || !url) { throw new Error('Tải tệp thất bại'); }
    return { url, publicId: result.data?.public_id };
  },
});
