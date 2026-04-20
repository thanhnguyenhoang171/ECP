import * as ort from 'onnxruntime-web';

const MODEL_SIZE = 640;

const canvas = document.createElement('canvas');
canvas.width = MODEL_SIZE;
canvas.height = MODEL_SIZE;

const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

export const imageHelper = {
  // ==============================
  // Convert video → tensor
  // ==============================
  videoToTensor: (video: HTMLVideoElement): ort.Tensor => {
    ctx.drawImage(video, 0, 0, MODEL_SIZE, MODEL_SIZE);

    const imageData = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;

    const float32Data = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
    const step = MODEL_SIZE * MODEL_SIZE;

    for (let i = 0; i < step; i++) {
      float32Data[i] = imageData[i * 4] / 255.0;
      float32Data[step + i] = imageData[i * 4 + 1] / 255.0;
      float32Data[step * 2 + i] = imageData[i * 4 + 2] / 255.0;
    }

    return new ort.Tensor('float32', float32Data, [
      1,
      3,
      MODEL_SIZE,
      MODEL_SIZE,
    ]);
  },

  // ==============================
  // Decode output (300,6)
  // ==============================
  getTopBox: (outputTensor: ort.Tensor) => {
    const data = outputTensor.data as Float32Array;

    const numBoxes = 300;
    let bestConf = 0;
    let bestBox = null;

    for (let i = 0; i < numBoxes; i++) {
      const offset = i * 6;

      const x1 = data[offset + 0];
      const y1 = data[offset + 1];
      const x2 = data[offset + 2];
      const y2 = data[offset + 3];
      const conf = data[offset + 4];

      if (conf > 0.4 && conf > bestConf) {
        bestConf = conf;

        bestBox = {
          x: x1,
          y: y1,
          w: x2 - x1,
          h: y2 - y1,
          prob: conf,
        };
      }
    }

    return bestBox;
  },
};
