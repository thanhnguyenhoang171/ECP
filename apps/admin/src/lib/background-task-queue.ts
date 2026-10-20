export interface TaskImage {
  url: string;
  publicId?: string;
}

export interface UploadTaskContext {
  readonly signal: AbortSignal;
  readonly upload: (file: File, folder: string) => Promise<TaskImage>;
  readonly saving: () => void;
}

export interface BackgroundTask {
  readonly id: string;
  readonly title: string;
  readonly resourceKey: string;
  readonly status: 'queued' | 'running' | 'succeeded' | 'failed';
  readonly stage: string;
  readonly total: number;
  readonly completed: number;
  readonly error?: string;
  readonly href?: string;
}

export interface BackgroundTaskInput {
  readonly title: string;
  readonly resourceKey: string;
  readonly files: readonly File[];
  readonly run: (context: UploadTaskContext) => Promise<string | void>;
}

interface QueueOptions {
  readonly upload: (file: File, folder: string, signal: AbortSignal) => Promise<TaskImage>;
  readonly changed: (tasks: readonly BackgroundTask[]) => void;
}

interface BackgroundTaskQueue {
  readonly enqueue: (input: BackgroundTaskInput) => string;
  readonly retry: (id: string) => void;
  readonly dismiss: (id: string) => void;
  readonly clear: () => void;
}

export const collectUploadFiles = (value: unknown): File[] => {
  const files = new Set<File>();
  const visit = (item: unknown): void => {
    if (typeof File !== 'undefined' && item instanceof File) {
      files.add(item);
    } else if (Array.isArray(item)) {
      for (const child of item) { visit(child); }
    } else if (item && typeof item === 'object') {
      for (const child of Object.values(item)) { visit(child); }
    }
  };
  visit(value);
  return [...files];
};

export const createBackgroundTaskQueue = (options: QueueOptions): BackgroundTaskQueue => {
  let tasks: BackgroundTask[] = [];
  let running = false;
  const entries = new Map<string, {
    input: BackgroundTaskInput;
    controller: AbortController;
    uploaded: Map<File, TaskImage>;
    pending: Map<File, Promise<TaskImage>>;
  }>();
  const publish = (): void => options.changed([...tasks]);
  const update = (id: string, changes: Partial<BackgroundTask>): void => {
    tasks = tasks.map((task) => task.id === id ? { ...task, ...changes } : task);
    publish();
  };
  const drain = async (): Promise<void> => {
    if (running) { return; }
    running = true;
    try {
      let task = tasks.find((item) => item.status === 'queued');
      while (task) {
        const { id } = task;
        const entry = entries.get(id);
        if (!entry) { break; }
        update(id, { status: 'running', stage: 'Đang tải ảnh và lưu dữ liệu', error: undefined });
        try {
          const href = await entry.input.run({
            signal: entry.controller.signal,
            saving: () => {
              entry.controller.signal.throwIfAborted();
              update(id, { stage: 'Đang lưu dữ liệu' });
            },
            upload: async (file, folder) => {
              entry.controller.signal.throwIfAborted();
              const cached = entry.uploaded.get(file);
              if (cached) { return cached; }
              const pending = entry.pending.get(file);
              if (pending) { return pending; }
              const upload = async (): Promise<TaskImage> => {
                try {
                  const image = await options.upload(file, folder, entry.controller.signal);
                  entry.controller.signal.throwIfAborted();
                  entry.uploaded.set(file, image);
                  update(id, { completed: entry.uploaded.size, stage: 'Đang tải tệp' });
                  return image;
                } finally {
                  entry.pending.delete(file);
                }
              };
              const promise = upload();
              entry.pending.set(file, promise);
              return promise;
            },
          });
          entry.controller.signal.throwIfAborted();
          update(id, { status: 'succeeded', stage: 'Hoàn tất', href: href || undefined });
          entries.delete(id);
        } catch (error: unknown) {
          update(id, {
            status: 'failed', stage: 'Chưa hoàn tất',
            error: error instanceof Error ? error.message : 'Không thể hoàn tất công việc',
          });
        }
        task = tasks.find((item) => item.status === 'queued');
      }
    } finally {
      running = false;
    }
  };
  const start = (): void => {
    void drain().catch((error: unknown) => { console.error('Background task queue failed:', error); });
  };
  return {
    enqueue: (input: BackgroundTaskInput): string => {
      if (tasks.some((task) => task.resourceKey === input.resourceKey && task.status !== 'succeeded')) {
        throw new Error('Mục này đang có công việc chưa hoàn tất. Vui lòng kiểm tra thông báo ở header.');
      }
      const id = crypto.randomUUID();
      entries.set(id, { input, controller: new AbortController(), uploaded: new Map(), pending: new Map() });
      tasks = [...tasks, {
        id, title: input.title, resourceKey: input.resourceKey, status: 'queued',
        stage: 'Đang chờ xử lý', total: new Set(input.files).size, completed: 0,
      }];
      publish();
      start();
      return id;
    },
    retry: (id: string): void => {
      if (!tasks.some((task) => task.id === id && task.status === 'failed')) { return; }
      update(id, { status: 'queued', error: undefined, stage: 'Đang chờ thử lại' });
      start();
    },
    dismiss: (id: string): void => {
      if (tasks.some((task) => task.id === id && ['queued', 'running'].includes(task.status))) { return; }
      entries.delete(id);
      tasks = tasks.filter((task) => task.id !== id);
      publish();
    },
    clear: (): void => {
      for (const entry of entries.values()) { entry.controller.abort(); }
      entries.clear();
      tasks = [];
      publish();
    },
  };
};
