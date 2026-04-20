import * as ort from 'onnxruntime-web';

/**
 * QUAN TRỌNG: Khớp phiên bản CDN với package.json (1.24.3)
 * Điều này sửa lỗi "e.getValue is not a function"
 */
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

let session: ort.InferenceSession | null = null;

export const yoloService = {
  loadModel: async () => {
    try {
      if (session) return session;
      
      console.log("⏳ Đang nạp AI Model (v1.24.3)...");
      
      // Sử dụng cấu hình cơ bản nhất để đảm bảo tính tương thích
      session = await ort.InferenceSession.create('/models/best_int8.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });
      
      console.log("✅ AI Model nạp thành công!", session.inputNames);
      return session;
    } catch (e) {
      console.error("❌ Lỗi nạp model:", e);
      throw e;
    }
  },

  detect: async (inputTensor: ort.Tensor): Promise<ort.Tensor> => {
    if (!session) throw new Error("AI chưa sẵn sàng");
    
    // Đảm bảo lấy đúng tên input của model
    const inputName = session.inputNames[0];
    const results = await session.run({ [inputName]: inputTensor });
    return results[session.outputNames[0]];
  }
};
