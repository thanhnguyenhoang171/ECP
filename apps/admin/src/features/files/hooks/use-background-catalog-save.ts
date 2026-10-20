'use client';

import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

import { collectUploadFiles, type UploadTaskContext } from '@/lib/background-task-queue';
import { backgroundTasks, useBackgroundTasksStore } from '@/store/backgroundTasksStore';

interface CatalogSaveInput {
  readonly title: string;
  readonly resourceKey: string;
  readonly values: unknown;
  readonly queryKeys: readonly QueryKey[];
  readonly save: (context: UploadTaskContext) => Promise<string>;
}

export const useBackgroundCatalogSave = (): ((input: CatalogSaveInput) => boolean) => {
  const queryClient = useQueryClient();
  return (input) => {
    if (useBackgroundTasksStore.getState().tasks.some((task) => task.resourceKey === input.resourceKey && task.status !== 'succeeded')) {
      const message = 'Mục này đang có công việc chưa hoàn tất. Vui lòng kiểm tra chuông thông báo.';
      toast.error(message);
      throw new Error(message);
    }
    const files = collectUploadFiles(input.values);
    if (files.length === 0) { return false; }
    let savedHref: string | undefined;
    backgroundTasks.enqueue({
      title: input.title, resourceKey: input.resourceKey, files,
      run: async (context) => {
        savedHref ??= await input.save(context);
        await Promise.all(input.queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
        return savedHref;
      },
    });
    toast.success('Đã tiếp nhận yêu cầu', {
      description: 'Ảnh và dữ liệu đang được xử lý nền. Theo dõi tại chuông thông báo.',
    });
    return true;
  };
};
