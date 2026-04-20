import React, { useEffect, useRef, useState } from 'react';
import { message, Button, List, Typography, Progress, Modal } from 'antd';
import { ScanOutlined, CheckCircleOutlined, AimOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';

const MODEL_SIZE = 640;
const MAX_SAMPLES = 5;
const AI_THROTTLE_MS = 100; // 10 FPS để ổn định hơn

interface ScannedItem {
    id: string;
    image: string;
    timestamp: string;
    prob: number;
}

const BarcodeScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const workerRef = useRef<Worker | null>(null);
    
    const pendingFrames = useRef<Map<number, ImageBitmap>>(new Map());
    const frameIdCounter = useRef(0);
    const lastAiRun = useRef(0);

    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [scans, setScans] = useState<ScannedItem[]>([]);
    const [isFlash, setIsFlash] = useState(false);
    const [sampleCount, setSampleCount] = useState(0);
    
    const sampleBuffer = useRef<any[]>([]);
    const isProcessingRef = useRef(false);
    const isSamplingRef = useRef(false);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../../../workers/yoloWorker.ts', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'READY') setStatus('ready');
            if (e.data.type === 'RESULT') {
                const { box, meta } = e.data;
                const bitmap = pendingFrames.current.get(meta.frameId);
                
                drawBox(box);
                // CHỈ BẮT ĐẦU KHI CHẮC CHẮN (>70%)
                if (box && box.prob > 0.7 && !isSamplingRef.current && bitmap) {
                    collectSample(box, bitmap);
                } else if (bitmap) {
                    bitmap.close();
                }
                
                pendingFrames.current.delete(meta.frameId);
                isProcessingRef.current = false;
            }
        };

        workerRef.current.postMessage({ type: 'INIT' });

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        }).then(stream => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(console.error);
            }
        }).catch(() => setStatus('error'));

        return () => {
            workerRef.current?.terminate();
            pendingFrames.current.forEach(b => b.close());
            pendingFrames.current.clear();
        };
    }, []);

    useEffect(() => {
        let animationId: number;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = MODEL_SIZE;
        offCanvas.height = MODEL_SIZE;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!;

        const loop = (time: number) => {
            if (status === 'ready' && videoRef.current && !isProcessingRef.current) {
                if (time - lastAiRun.current >= AI_THROTTLE_MS) {
                    const video = videoRef.current;
                    if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused) {
                        isProcessingRef.current = true;
                        lastAiRun.current = time;

                        const size = Math.min(video.videoWidth, video.videoHeight);
                        const sx = (video.videoWidth - size) / 2;
                        const sy = (video.videoHeight - size) / 2;
                        
                        offCtx.drawImage(video, sx, sy, size, size, 0, 0, MODEL_SIZE, MODEL_SIZE);
                        
                        const frameId = ++frameIdCounter.current;
                        createImageBitmap(offCanvas).then(bitmap => {
                            pendingFrames.current.set(frameId, bitmap);
                            const imageData = offCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE);
                            const buffer = imageData.data.buffer;
                            workerRef.current?.postMessage({ type: 'DETECT', buffer, meta: { frameId } }, [buffer]);
                        });
                    }
                }
            }
            animationId = requestAnimationFrame(loop);
        };
        animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, [status]);

    const collectSample = (box: any, bitmap: ImageBitmap) => {
        sampleBuffer.current.push({ ...box, bitmap });
        setSampleCount(sampleBuffer.current.length);
        if (sampleBuffer.current.length >= MAX_SAMPLES) {
            isSamplingRef.current = true;
            processBestSample();
        }
    };

    const processBestSample = () => {
        const best = sampleBuffer.current.reduce((prev, curr) => (prev.prob > curr.prob) ? prev : curr);

        if (best.prob >= 0.85) { // Nâng ngưỡng thực tế lên 85%
            const cropCanvas = document.createElement('canvas');
            const x = Math.max(0, Math.floor(best.x)), y = Math.max(0, Math.floor(best.y));
            const w = Math.min(MODEL_SIZE - x, Math.floor(best.w)), h = Math.min(MODEL_SIZE - y, Math.floor(best.h));
            
            cropCanvas.width = w; cropCanvas.height = h;
            const ctx = cropCanvas.getContext('2d')!;
            ctx.drawImage(best.bitmap, x, y, w, h, 0, 0, w, h);

            setScans(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                image: cropCanvas.toDataURL('image/png'),
                timestamp: new Date().toLocaleTimeString(),
                prob: best.prob
            }, ...prev].slice(0, 5));
            
            setIsFlash(true);
            setTimeout(() => setIsFlash(false), 150);
            resetScanner(1200);
        } else if (best.prob < 0.75) {
            Modal.confirm({
                title: "Chất lượng quét kém",
                content: `AI chỉ tin tưởng ${(best.prob * 100).toFixed(1)}%. Vui lòng hướng camera thẳng vào mã vạch.`,
                okText: "Thử lại",
                onOk: () => resetScanner(0),
                onCancel: () => resetScanner(500)
            });
        } else {
            resetScanner(300);
        }
        sampleBuffer.current.forEach(s => s.bitmap.close());
    };

    const resetScanner = (delay: number) => {
        setTimeout(() => {
            sampleBuffer.current = [];
            setSampleCount(0);
            isSamplingRef.current = false;
        }, delay);
    };

    const drawBox = (box: any) => {
        const canvas = canvasRef.current, video = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext('2d')!;
        if (canvas.width !== video.clientWidth) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (box) {
            const size = Math.min(video.clientWidth, video.clientHeight);
            const dx = (video.clientWidth - size) / 2, dy = (video.clientHeight - size) / 2;
            const scale = size / MODEL_SIZE;
            ctx.strokeStyle = isSamplingRef.current ? '#F59E0B' : '#10B981';
            ctx.lineWidth = 4;
            ctx.strokeRect(dx + box.x * scale, dy + box.y * scale, box.w * scale, box.h * scale);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
                {isFlash && <div className="absolute inset-0 bg-white z-20 animate-out fade-out duration-150" />}
                {sampleCount > 0 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-48 text-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                        <div className="text-[10px] font-black text-white uppercase mb-2 tracking-widest flex items-center justify-center gap-2">
                           <AimOutlined className="animate-spin" /> AI SCANNING...
                        </div>
                        <Progress percent={(sampleCount / MAX_SAMPLES) * 100} showInfo={false} strokeColor="#10B981" size="small" />
                    </div>
                )}
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">AI VISION LIVE</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 px-2">
                    <Typography.Title level={5} className="!m-0 flex items-center gap-2">
                        <ScanOutlined className="text-primary-600" /> KẾT QUẢ QUÉT
                    </Typography.Title>
                    <Button type="text" danger size="small" onClick={() => setScans([])}>Xóa</Button>
                </div>

                <List
                    dataSource={scans}
                    locale={{ emptyText: <div className="py-8 text-slate-400 italic text-sm">Hướng camera vào mã vạch...</div> }}
                    renderItem={(item) => (
                        <div className="flex items-center gap-4 p-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <img src={item.image} alt="Crop" className="w-20 h-10 object-contain bg-white rounded-lg border border-slate-200" />
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Barcode Optimized</div>
                                <div className="text-[9px] text-slate-400 font-medium">Độ tin cậy: {(item.prob * 100).toFixed(1)}% • {item.timestamp}</div>
                            </div>
                            <CheckCircleOutlined className="text-emerald-500 text-lg" />
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default BarcodeScanner;
