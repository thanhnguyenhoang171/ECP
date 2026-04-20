import * as ort from 'onnxruntime-web';

const MODEL_SIZE = 640;

export const imageHelper = {
    /**
     * Bước Tiền xử lý: Chuyển Video Frame thành Tensor [1, 3, 640, 640]
     */
    videoToTensor: (video: HTMLVideoElement): ort.Tensor => {
        const canvas = document.createElement('canvas');
        canvas.width = MODEL_SIZE;
        canvas.height = MODEL_SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        
        ctx.drawImage(video, 0, 0, MODEL_SIZE, MODEL_SIZE);
        const imageData = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;

        const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
        
        // Optimize loop for performance
        const step = MODEL_SIZE * MODEL_SIZE;
        for (let i = 0; i < step; i++) {
            float32Data[i] = imageData[i * 4] / 255.0;            // R
            float32Data[step + i] = imageData[i * 4 + 1] / 255.0; // G
            float32Data[step * 2 + i] = imageData[i * 4 + 2] / 255.0; // B
        }

        return new ort.Tensor('float32', float32Data, [1, 3, MODEL_SIZE, MODEL_SIZE]);
    },

    /**
     * Bước Hậu xử lý cho YOLOv8/v11 (Single Class Barcode)
     * Output shape: [1, 5, 8400]
     */
    getTopBox: (outputTensor: ort.Tensor) => {
        const data = outputTensor.data as Float32Array;
        const numBoxes = 8400; 
        
        let bestConf = 0;
        let bestBox = null;

        for (let i = 0; i < numBoxes; i++) {
            // Index 4 là confidence score cho class Barcode
            const confidence = data[4 * numBoxes + i]; 
            
            if (confidence > 0.6 && confidence > bestConf) { // Tăng ngưỡng lọc nhiễu lên 0.6 cho model thật
                bestConf = confidence;
                
                // Trích xuất tọa độ [x_center, y_center, w, h]
                const xc = data[0 * numBoxes + i];
                const yc = data[1 * numBoxes + i];
                const w = data[2 * numBoxes + i];
                const h = data[3 * numBoxes + i];

                bestBox = {
                    x: xc - w / 2, 
                    y: yc - h / 2,
                    w: w,
                    h: h,
                    prob: confidence
                };
            }
        }
        return bestBox;
    }
};
