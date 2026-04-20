import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

let session: ort.InferenceSession | null = null;

export const yoloService = {
  loadModel: async () => {
    try {
      if (session) return session;
      
      // Ưu tiên 'webgl' để dùng GPU điện thoại, fallback về 'wasm'
      session = await ort.InferenceSession.create('/models/best_int8.onnx', {
        executionProviders: ['webgl', 'wasm'], 
        graphOptimizationLevel: 'all'
      });
      
      console.log("✅ AI Engine initialized successfully");
      return session;
    } catch (e) {
      console.error("❌ Model Load Error:", e);
      throw e;
    }
  },

  detect: async (inputTensor: ort.Tensor): Promise<ort.Tensor> => {
    if (!session) throw new Error("AI not ready");
    const inputName = session.inputNames[0];
    const results = await session.run({ [inputName]: inputTensor });
    return results[session.outputNames[0]];
  }
};
