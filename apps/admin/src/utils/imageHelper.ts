import * as ort from 'onnxruntime-web';

const MODEL_SIZE = 640;
// Tạo một canvas dùng chung để tránh tạo mới liên tục gây lag
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = MODEL_SIZE;
offscreenCanvas.height = MODEL_SIZE;
const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true })!;

export const imageHelper = {
    /**
     * Tối ưu cho Mobile: Cắt vùng trung tâm (Crop) thay vì nén toàn bộ ảnh
     */
    videoToTensor: (video: HTMLVideoElement): ort.Tensor => {
        const { videoWidth, videoHeight } = video;
        
        // Tính toán để cắt một khối vuông ở giữa video
        const size = Math.min(videoWidth, videoHeight);
        const sx = (videoWidth - size) / 2;
        const sy = (videoHeight - size) / 2;

        // Vẽ vùng trung tâm vào canvas 640x640
        offscreenCtx.drawImage(video, sx, sy, size, size, 0, 0, MODEL_SIZE, MODEL_SIZE);
        const imageData = offscreenCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;

        const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
        const step = MODEL_SIZE * MODEL_SIZE;
        
        for (let i = 0; i < step; i++) {
            float32Data[i] = imageData[i * 4] / 255.0;            // R
            float32Data[step + i] = imageData[i * 4 + 1] / 255.0; // G
            float32Data[step * 2 + i] = imageData[i * 4 + 2] / 255.0; // B
        }

        return new ort.Tensor('float32', float32Data, [1, 3, MODEL_SIZE, MODEL_SIZE]);
    },

    /**
     * Tìm box với logic lọc nhiễu tốt hơn
     */
    getTopBox: (outputTensor: ort.Tensor) => {
        const data = outputTensor.data as Float32Array;
        const numBoxes = 8400; 
        
        let bestConf = 0;
        let bestBox = null;

        for (let i = 0; i < numBoxes; i++) {
            const confidence = data[4 * numBoxes + i]; 
            
            // Ngưỡng 0.5 là phù hợp cho model int8
            if (confidence > 0.5 && confidence > bestConf) {
                bestConf = confidence;
                
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
