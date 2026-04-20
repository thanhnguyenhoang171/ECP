import express from 'express';
import cors from 'cors';
import * as ort from 'onnxruntime-node';
import { Jimp } from 'jimp';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const MODEL_SIZE = 640;
let session: ort.InferenceSession | null = null;
const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);

// Load model
async function initModel() {
    try {
        const modelPath = path.resolve(__dirname, '../models/best_int8.onnx');
        session = await ort.InferenceSession.create(modelPath);
        console.log('✅ YOLO ONNX Model loaded successfully');
    } catch (err) {
        console.error('❌ Failed to load YOLO ONNX Model', err);
    }
}
initModel();

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

app.post('/api/v1/detect', async (req: express.Request, res: express.Response): Promise<any> => {
    if (!session) {
        return res.status(503).json({ error: 'Model is not ready' });
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // image can be base64 string
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const img = await Jimp.read(buffer);
        img.resize({ w: MODEL_SIZE, h: MODEL_SIZE });
        
        // Prepare tensor
        let i = 0;
        img.scan((x, y, idx) => {
            float32Data[i] = img.bitmap.data[idx] / 255.0;
            float32Data[409600 + i] = img.bitmap.data[idx + 1] / 255.0;
            float32Data[819200 + i] = img.bitmap.data[idx + 2] / 255.0;
            i++;
        });

        const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_SIZE, MODEL_SIZE]);
        const results = await session.run({ [session.inputNames[0]]: tensor });
        const output = results[session.outputNames[0]];
        const box = getTopBox(output.data as Float32Array, output.dims);

        return res.json({ box });
    } catch (error: any) {
        console.error('Detection error:', error);
        return res.status(500).json({ error: error.message });
    }
});

const PORT = 3005;
app.listen(PORT, () => {
    console.log(`🚀 Vision API running at http://localhost:${PORT}`);
});
