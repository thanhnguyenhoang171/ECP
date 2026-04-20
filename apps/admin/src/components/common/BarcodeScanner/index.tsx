import React, { useEffect, useRef, useState, useCallback } from 'react';
import { message, Button, List, Typography, Progress, Modal } from 'antd';
import { ScanOutlined, CheckCircleOutlined, AimOutlined } from '@ant-design/icons';
import type { DetectionBox } from '../../../interfaces';

const MODEL_SIZE = 640;
const MAX_SAMPLES = 5;
const SAMPLING_TIMEOUT_MS = 5000; 

interface ScannedItem {
    id: string;
    image: string;
    timestamp: string;
    prob: number;
}

interface SampleItem extends DetectionBox {
    frame: string;
}

const BarcodeScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const samplingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [scans, setScans] = useState<ScannedItem[]>([]);
    const [isFlash, setIsFlash] = useState(false);
    const [sampleCount, setSampleCount] = useState(0);
    
    const sampleBuffer = useRef<SampleItem[]>([]);
    const isProcessingRef = useRef(false);
    const isSamplingRef = useRef(false);
    const lastProcessTime = useRef(0);

    // -- MOVE HELPERS UP --

    const resetScanner = useCallback((delay: number) => {
        setTimeout(() => {
            sampleBuffer.current = [];
            setSampleCount(0);
            isSamplingRef.current = false;
        }, delay);
    }, []);

    const drawBox = useCallback((box: DetectionBox | null) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext('2d')!;
        if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (box) {
            const size = Math.min(video.clientWidth, video.clientHeight);
            const dx = (video.clientWidth - size) / 2;
            const dy = (video.clientHeight - size) / 2;
            const scale = size / MODEL_SIZE;
            ctx.strokeStyle = isSamplingRef.current ? '#F59E0B' : '#10B981';
            ctx.lineWidth = 4;
            ctx.strokeRect(dx + box.x * scale, dy + box.y * scale, box.w * scale, box.h * scale);
        }
    }, []);

    const processBestSample = useCallback(() => {
        const best = sampleBuffer.current.reduce((p, c) => (p.prob > c.prob) ? p : c);

        if (best.prob >= 0.8) {
            const img = new Image();
            img.onload = () => {
                const cropCanvas = document.createElement('canvas');
                const x = Math.max(0, Math.floor(best.x)), y = Math.max(0, Math.floor(best.y));
                const w = Math.min(MODEL_SIZE - x, Math.floor(best.w)), h = Math.min(MODEL_SIZE - y, Math.floor(best.h));
                cropCanvas.width = w; cropCanvas.height = h;
                const ctx = cropCanvas.getContext('2d')!;
                ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

                setScans(prev => [{
                    id: Math.random().toString(36).substring(2, 11),
                    image: cropCanvas.toDataURL('image/jpeg', 0.9),
                    timestamp: new Date().toLocaleTimeString(),
                    prob: best.prob
                }, ...prev].slice(0, 5));
                setIsFlash(true);
                setTimeout(() => setIsFlash(false), 150);
                resetScanner(1200);
            };
            img.src = best.frame;
        } else if (best.prob < 0.7) {
            Modal.confirm({
                title: "Chất lượng quét không đạt",
                content: `Độ tin cậy tốt nhất chỉ đạt ${(best.prob * 100).toFixed(1)}%. Thử lại?`,
                okText: "Quét lại",
                onOk: () => resetScanner(0),
                onCancel: () => resetScanner(500)
            });
        } else {
            resetScanner(200);
        }
    }, [resetScanner]);

    const collectSample = useCallback((box: DetectionBox, frameUrl: string) => {
        if (sampleBuffer.current.length === 0) {
            if (samplingTimer.current) clearTimeout(samplingTimer.current);
            samplingTimer.current = setTimeout(() => {
                if (sampleBuffer.current.length < MAX_SAMPLES) {
                    resetScanner(0);
                    message.warning("Quá thời gian lấy mẫu. Vui lòng quét lại.");
                }
            }, SAMPLING_TIMEOUT_MS);
        }

        sampleBuffer.current.push({ ...box, frame: frameUrl });
        setSampleCount(sampleBuffer.current.length);

        if (sampleBuffer.current.length >= MAX_SAMPLES) {
            if (samplingTimer.current) clearTimeout(samplingTimer.current);
            isSamplingRef.current = true;
            processBestSample();
        }
    }, [processBestSample, resetScanner]);

    // -- EFFECTS AFTER HELPERS --

    useEffect(() => {
        offCanvasRef.current = document.createElement('canvas');
        offCanvasRef.current.width = MODEL_SIZE;
        offCanvasRef.current.height = MODEL_SIZE;

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
        }).then(stream => {
            setStatus('ready'); // Assuming backend is always ready once camera loads
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(console.error);
                };
            }
        }).catch(() => setStatus('error'));

        return () => {
            if (samplingTimer.current) clearTimeout(samplingTimer.current);
        };
    }, [collectSample, drawBox]);

    useEffect(() => {
        let animationId: number;
        const offCtx = offCanvasRef.current?.getContext('2d', { willReadFrequently: true });
        const loop = () => {
            if (status === 'ready' && videoRef.current && !isProcessingRef.current && offCtx) {
                const video = videoRef.current;
                const now = performance.now();
                if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused && (now - lastProcessTime.current > 600)) {
                    isProcessingRef.current = true;
                    lastProcessTime.current = now;
                    const size = Math.min(video.videoWidth, video.videoHeight);
                    const sx = (video.videoWidth - size) / 2;
                    const sy = (video.videoHeight - size) / 2;
                    
                    offCtx.drawImage(video, sx, sy, size, size, 0, 0, MODEL_SIZE, MODEL_SIZE);
                    
                    offCanvasRef.current!.toBlob((blob) => {
                        if (!blob) {
                            isProcessingRef.current = false;
                            return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const frameUrl = reader.result as string;

                            let baseUrl = import.meta.env.VITE_VISION_API_URL;
                            if (!baseUrl) {
                                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                                    baseUrl = 'http://localhost:3005';
                                } else {
                                    baseUrl = `${window.location.protocol}//vision-api.${window.location.hostname.replace('admin.', '')}`;
                                }
                            }

                            fetch(`${baseUrl}/api/v1/detect`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ image: frameUrl })
                            })
                            .then(res => res.json())
                            .then(data => {
                                const box = data.box;
                                drawBox(box);
                                if (box && box.prob > 0.6 && !isSamplingRef.current) {
                                    collectSample(box, frameUrl);
                                }
                            })
                            .catch(err => console.error('YOLO Fetch Error:', err))
                            .finally(() => {
                                isProcessingRef.current = false;
                            });
                        };
                        reader.readAsDataURL(blob);
                    }, 'image/jpeg', 0.5);
                }
            }
            animationId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animationId);
    }, [status, drawBox, collectSample]);

    return (
        <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
                {isFlash && <div className="absolute inset-0 bg-white z-20 animate-out fade-out duration-150" />}
                {sampleCount > 0 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-48 text-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                        <div className="text-[10px] font-black text-white uppercase mb-2 tracking-widest flex items-center justify-center gap-2">
                           <AimOutlined className="animate-spin" /> AI OPTIMIZING...
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
                    <Typography.Title level={5} className="!m-0 flex items-center gap-2"><ScanOutlined className="text-primary-600" /> KẾT QUẢ TỐT NHẤT</Typography.Title>
                    <Button type="text" danger size="small" onClick={() => setScans([])}>Xóa</Button>
                </div>
                <List dataSource={scans} renderItem={(item) => (
                    <div className="flex items-center gap-4 p-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                        <img src={item.image} alt="Crop" className="w-20 h-10 object-contain bg-white rounded-lg border border-slate-200" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">Optimized Result</div>
                            <div className="text-[9px] text-slate-400 font-medium">Conf: {(item.prob * 100).toFixed(1)}% • {item.timestamp}</div>
                        </div>
                        <CheckCircleOutlined className="text-emerald-500 text-lg" />
                    </div>
                )} />
            </div>
        </div>
    );
};

export default BarcodeScanner;
