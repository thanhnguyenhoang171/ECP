import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { test } from 'node:test';

import { collectUploadFiles, createBackgroundTaskQueue, type BackgroundTask } from '../src/lib/background-task-queue.ts';

const waitFor = async (condition: () => boolean): Promise<void> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (condition()) { return; }
    await setTimeout(5);
  }
  assert.fail('Background task did not reach the expected state');
};

const deferred = <T,>(): { promise: Promise<T>; resolve: (value: T) => void } => {
  let resolve: (value: T) => void = () => { throw new Error('Promise not initialized'); };
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
};

test('submission returns immediately; completion waits for upload AND saving', async () => {
  let tasks: readonly BackgroundTask[] = [];
  const upload = deferred<{ url: string }>();
  const saved = deferred<string>();
  const file = new File(['image'], 'image.png');
  const queue = createBackgroundTaskQueue({ upload: async () => upload.promise, changed: (next) => { tasks = next; } });
  const id = queue.enqueue({
    title: 'Create', resourceKey: 'products:new', files: [file],
    run: async (context) => { await context.upload(file, 'products'); context.saving(); return saved.promise; },
  });
  assert.equal(tasks[0].id, id);
  assert.equal(tasks[0].status, 'running');
  assert.equal(tasks[0].completed, 0);
  upload.resolve({ url: 'https://example.test/image.png' });
  await waitFor(() => tasks[0].completed === 1);
  assert.equal(tasks[0].status, 'running');
  saved.resolve('/products/1');
  await waitFor(() => tasks[0].status === 'succeeded');
  assert.equal(tasks[0].href, '/products/1');
});

test('failed save can retry without uploading successful files again', async () => {
  let tasks: readonly BackgroundTask[] = [];
  let uploads = 0;
  let saves = 0;
  const file = new File(['image'], 'image.png');
  const queue = createBackgroundTaskQueue({
    upload: async () => { uploads += 1; return { url: 'https://example.test/image.png' }; },
    changed: (next) => { tasks = next; },
  });
  const id = queue.enqueue({ title: 'Edit', resourceKey: 'product:1', files: [file], run: async (context) => {
    await context.upload(file, 'products');
    saves += 1;
    if (saves === 1) { throw new Error('Save failed'); }
    return '/products/1';
  } });
  await waitFor(() => tasks[0].status === 'failed');
  assert.equal(tasks[0].error, 'Save failed');
  assert.throws(() => queue.enqueue({ title: 'Duplicate', resourceKey: 'product:1', files: [], run: async () => undefined }));
  queue.retry(id);
  await waitFor(() => tasks[0].status === 'succeeded');
  assert.equal(uploads, 1);
  assert.equal(saves, 2);
  queue.dismiss(id);
  assert.equal(tasks.length, 0);
});

test('queue serializes jobs and keeps pending jobs when one fails', async () => {
  let tasks: readonly BackgroundTask[] = [];
  const first = deferred<void>();
  const order: string[] = [];
  const queue = createBackgroundTaskQueue({ upload: async () => ({ url: '' }), changed: (next) => { tasks = next; } });
  queue.enqueue({ title: 'First', resourceKey: '1', files: [], run: async () => { order.push('first'); await first.promise; throw new Error('Failure'); } });
  queue.enqueue({ title: 'Second', resourceKey: '2', files: [], run: async () => { order.push('second'); } });
  assert.deepEqual(order, ['first']);
  assert.equal(tasks[1].status, 'queued');
  first.resolve();
  await waitFor(() => tasks[1].status === 'succeeded');
  assert.deepEqual(order, ['first', 'second']);
  assert.equal(tasks[0].status, 'failed');
});

test('clearing jobs aborts running uploads and removes queued work', async () => {
  let tasks: readonly BackgroundTask[] = [];
  let uploadSignal: AbortSignal | undefined;
  let secondRan = false;
  const queue = createBackgroundTaskQueue({
    changed: (next) => { tasks = next; },
    upload: async (_file, _folder, signal) => {
      uploadSignal = signal;
      await new Promise<void>((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
      return { url: '' };
    },
  });
  const file = new File(['x'], 'x.png');
  queue.enqueue({ title: 'First', resourceKey: '1', files: [file], run: async (context) => { await context.upload(file, 'products'); } });
  queue.enqueue({ title: 'Second', resourceKey: '2', files: [], run: async () => { secondRan = true; } });
  queue.clear();
  await setTimeout(10);
  assert.equal(uploadSignal?.aborted, true);
  assert.equal(tasks.length, 0);
  assert.equal(secondRan, false);
});

test('a file shared by thumbnail/gallery is uploaded once, including concurrent calls', async () => {
  let tasks: readonly BackgroundTask[] = [];
  let uploads = 0;
  const file = new File(['x'], 'x.png');
  assert.deepEqual(collectUploadFiles({ thumbnail: file, images: [file], variants: [{ image: file }] }), [file]);
  const queue = createBackgroundTaskQueue({
    changed: (next) => { tasks = next; },
    upload: async () => { uploads += 1; await setTimeout(5); return { url: 'https://example.test/x.png' }; },
  });
  queue.enqueue({ title: 'Shared', resourceKey: '1', files: [file, file], run: async (context) => {
    const result = await Promise.all([context.upload(file, 'products'), context.upload(file, 'products')]);
    assert.deepEqual(result[0], result[1]);
  } });
  await waitFor(() => tasks[0].status === 'succeeded');
  assert.equal(uploads, 1);
  assert.equal(tasks[0].total, 1);
  assert.equal(tasks[0].completed, 1);
});
