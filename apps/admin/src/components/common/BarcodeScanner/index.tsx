import { useEffect, useRef, useState } from 'react';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { yoloService } from '../../../api/services/yoloService';
import { imageHelper } from '../../../utils/imageHelper';

const BarcodeScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ready, setReady] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const lastBox = useRef<any>(null);
  const processing = useRef(false);


  // ==============================
  // Load model
  // ==============================
  useEffect(() => {
    yoloService
      .loadModel()
      .then(() => setReady(true))
      .catch(() => message.error('Lỗi load AI'));
  }, []);

  // ==============================
  // Camera
  // ==============================
  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment' },
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      })
      .catch(() => message.error('Không mở được camera'));

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // ==============================
  // DRAW UI
  // ==============================
  useEffect(() => {
    let raf: number;

    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
        const ctx = canvas.getContext('2d')!;

        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const box = lastBox.current;

        if (box) {
          const scaleX = canvas.width / 640;
          const scaleY = canvas.height / 640;

          const x = box.x * scaleX;
          const y = box.y * scaleY;
          const w = box.w * scaleX;
          const h = box.h * scaleY;

          ctx.strokeStyle = 'lime';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          ctx.fillStyle = 'lime';
          ctx.fillText(`${(box.prob * 100).toFixed(0)}%`, x, y - 5);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ==============================
  // RUN AI LOOP
  // ==============================
  useEffect(() => {
    let timer: any;

    const run = async () => {
      if (ready && videoRef.current && !processing.current) {
        const video = videoRef.current;

        if (video.readyState === 4) {
          processing.current = true;

          try {
            const tensor = imageHelper.videoToTensor(video);
            const output = await yoloService.detect(tensor);

            const box = imageHelper.getTopBox(output);

            lastBox.current = box;

            if (box && box.prob > 0.6) {
              const img = imageHelper.cropBarcode(box);
              setCroppedImage(img);
            }
          } catch (e) {
            console.error(e);
          }

          processing.current = false;
        }
      }

      timer = setTimeout(run, 120);
    };

    run();
    return () => clearTimeout(timer);
  }, [ready]);

  // ==============================
  // UI
  // ==============================
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)',
            zIndex: 10,
          }}
        >
          <Spin indicator={<LoadingOutlined spin />} />
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <video ref={videoRef} style={{ width: '100%' }} playsInline muted />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      </div>

      {croppedImage && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p>Barcode detected:</p>
          <img
            src={croppedImage}
            alt="Cropped Barcode"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '2px solid lime',
              borderRadius: 4,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
