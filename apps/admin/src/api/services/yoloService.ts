import * as ort from 'onnxruntime-web';

// Fix WASM config (tránh lỗi crossOrigin)
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

let session: ort.InferenceSession | null = null;

export const yoloService = {
  loadModel: async () => {
    if (session) return session;

    try {
      session = await ort.InferenceSession.create('/models/best_int8.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });

      console.log('✅ Model loaded');
      console.log('Input:', session.inputNames);
      console.log('Output:', session.outputNames);

      return session;
    } catch (e) {
      console.error('❌ Load model error:', e);
      throw e;
    }
  },

  detect: async (inputTensor: ort.Tensor): Promise<ort.Tensor> => {
    if (!session) throw new Error('Model not loaded');

    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];

    const result = await session.run({ [inputName]: inputTensor });
    return result[outputName];
  },
};
