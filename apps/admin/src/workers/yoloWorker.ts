import * as ort from 'onnxruntime-web';

// Quay lại cấu hình WASM ổn định
ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency || 4, 8);
ort.env.wasm.simd = true;
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

let session: ort.InferenceSession | null = null;
const MODEL_SIZE = 640;
const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);

function getTopBox(data: Float32Array, dims: readonly number[]) {
    const numBoxes = dims[1]; 
    const boxSize = dims[2]; 
    let bestConf = 0;
    let bestBox = null;

    for (let i = 0; i < numBoxes; i++) {
        const offset = i * boxSize;
        let x1 = data[offset + 0], y1 = data[offset + 1], x2 = data[offset + 2], y2 = data[offset + 3];
        const confidence = data[offset + 4];

        if (confidence > 0.3 && confidence > bestConf) {
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
            session = await ort.InferenceSession.create('/models/best_int8.onnx', { 
                executionProviders: ['wasm'], 
                graphOptimizationLevel: 'all' 
            });
            self.postMessage({ type: 'READY' });
        } catch {
            self.postMessage({ type: 'ERROR', error: 'Lỗi tải AI' });
        }
    } 
    
    else if (type === 'DETECT') {
        if (!session) return;
        const buffer = e.data.buffer as ArrayBuffer;
        const imageData = new Uint8ClampedArray(buffer);

        for (let i = 0; i < MODEL_SIZE * MODEL_SIZE; i++) {
            float32Data[i] = imageData[i * 4] / 255.0;
            float32Data[409600 + i] = imageData[i * 4 + 1] / 255.0;
            float32Data[819200 + i] = imageData[i * 4 + 2] / 255.0;
        }

        try {
            const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_SIZE, MODEL_SIZE]);
            const results = await session.run({ [session.inputNames[0]]: tensor });
            const output = results[session.outputNames[0]];
            const box = getTopBox(output.data as Float32Array, output.dims);
            self.postMessage({ type: 'RESULT', box, meta });
        } catch {
            self.postMessage({ type: 'ERROR', error: 'Lỗi nhận diện' });
        }
    }
};
