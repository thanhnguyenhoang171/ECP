import * as ort from 'onnxruntime-web';

// Tối ưu hóa cấu hình WASM
ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency || 4, 8);
ort.env.wasm.simd = true;
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

let session: ort.InferenceSession | null = null;
const MODEL_SIZE = 640;
const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);

function getTopBox(data: Float32Array, dims: readonly number[]) {
    // Dims: [1, 300, 6] -> x1, y1, x2, y2, conf, cls
    const numBoxes = dims[1]; 
    const boxSize = dims[2]; 
    let bestConf = 0;
    let bestBox = null;

    for (let i = 0; i < numBoxes; i++) {
        const offset = i * boxSize;
        const confidence = data[offset + 4];
        const cls = data[offset + 5];

        // CHỈ LẤY CLASS 0 (Barcode) và độ tin cậy > 30%
        if (cls === 0 && confidence > 0.3 && confidence > bestConf) {
            let x1 = data[offset + 0], y1 = data[offset + 1], x2 = data[offset + 2], y2 = data[offset + 3];

            // Tự động sửa lỗi nếu tọa độ bị chuẩn hóa 0-1
            if (x2 <= 1.1 && y2 <= 1.1) {
                x1 *= 640; y1 *= 640; x2 *= 640; y2 *= 640;
            }

            bestConf = confidence;
            bestBox = { x: x1, y: y1, w: x2 - x1, h: y2 - y1, prob: confidence };
        }
    }
    return bestBox;
}

self.onmessage = async (e: MessageEvent) => {
    const { type, meta } = e.data;

    if (type === 'INIT') {
        try {
            // Thử WebGL/WASM để ổn định nhất, tránh WebGPU gây lỗi màu trên một số thiết bị
            session = await ort.InferenceSession.create('/models/best_int8.onnx', { 
                executionProviders: ['webgl', 'wasm'], 
                graphOptimizationLevel: 'all' 
            });
            self.postMessage({ type: 'READY', provider: (session as any).handler?.providerType });
        } catch (err) {
            self.postMessage({ type: 'ERROR', error: 'AI Initialization Failed' });
        }
    } 
    
    else if (type === 'DETECT') {
        if (!session) return;
        const buffer = e.data.buffer as ArrayBuffer;
        const imageData = new Uint8ClampedArray(buffer);

        // Tiền xử lý RGB chuẩn xác
        for (let i = 0; i < MODEL_SIZE * MODEL_SIZE; i++) {
            const p = i * 4;
            float32Data[i] = imageData[p] / 255.0;                      // R
            float32Data[409600 + i] = imageData[p + 1] / 255.0;          // G
            float32Data[819200 + i] = imageData[p + 2] / 255.0;          // B
        }

        try {
            const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_SIZE, MODEL_SIZE]);
            const results = await session.run({ [session.inputNames[0]]: tensor });
            const output = results[session.outputNames[0]];
            const box = getTopBox(output.data as Float32Array, output.dims);
            self.postMessage({ type: 'RESULT', box, meta });
        } catch (error) {
            self.postMessage({ type: 'ERROR', error: 'Detection error' });
        }
    }
};
