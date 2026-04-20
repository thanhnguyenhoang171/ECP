import { useEffect, useRef, useState, type FC } from 'react';
import { message, Spin } from 'antd';
import { yoloService } from '../../../api/services/yoloService';
import { imageHelper } from '../../../utils/imageHelper';
import { BarcodeOutlined, LoadingOutlined } from '@ant-design/icons';

export const BarcodeScanner: FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelReady, setIsModelReady] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);

    useEffect(() => {
        yoloService.loadModel()
            .then(() => setIsModelReady(true))
            .catch(() => message.error("Lỗi khởi động AI"));
    }, []);

    useEffect(() => {
        let currentStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                currentStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setIsCameraActive(true);
                    };
                }
            } catch (err) {
                console.error(err);
                message.error("Vui lòng cấp quyền Camera");
            }
        };
        startCamera();
        return () => currentStream?.getTracks().forEach(track => track.stop());
    }, []);

    useEffect(() => {
        let animationId: number;
        let lastRunTime = 0;

        const processFrame = async (timestamp: number) => {
            // Giảm xuống ~6 FPS cho Mobile mượt mà
            if (timestamp - lastRunTime < 150) {
                animationId = requestAnimationFrame(processFrame);
                return;
            }

            if (isModelReady && videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                
                if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused) {
                    try {
                        lastRunTime = timestamp;
                        const inputTensor = imageHelper.videoToTensor(video);
                        const output = await yoloService.detect(inputTensor);
                        const topBox = imageHelper.getTopBox(output);

                        const ctx = canvas.getContext('2d')!;
                        canvas.width = video.clientWidth;
                        canvas.height = video.clientHeight;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        if (topBox) {
                            // Tính toán lại tọa độ dựa trên cơ chế Crop (ROI)
                            const displaySize = Math.min(canvas.width, canvas.height);
                            const offsetX = (canvas.width - displaySize) / 2;
                            const offsetY = (canvas.height - displaySize) / 2;
                            
                            const scale = displaySize / 640;

                            const drawX = topBox.x * scale + offsetX;
                            const drawY = topBox.y * scale + offsetY;
                            const drawW = topBox.w * scale;
                            const drawH = topBox.h * scale;

                            ctx.strokeStyle = '#10b981'; 
                            ctx.lineWidth = 4;
                            ctx.strokeRect(drawX, drawY, drawW, drawH);
                            
                            ctx.fillStyle = '#10b981';
                            ctx.fillRect(drawX, drawY - 25, 55, 25);
                            ctx.fillStyle = '#FFFFFF';
                            ctx.font = 'bold 12px Inter';
                            ctx.fillText(`${(topBox.prob * 100).toFixed(0)}%`, drawX + 5, drawY - 8);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            animationId = requestAnimationFrame(processFrame);
        };

        animationId = requestAnimationFrame(processFrame);
        return () => cancelAnimationFrame(animationId);
    }, [isModelReady]);

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full bg-white rounded-2xl shadow-soft border border-slate-100">
            <div className="flex items-center gap-2 mb-4 w-full">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <BarcodeOutlined className="text-xl" />
                </div>
                <div className="overflow-hidden">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                        {isModelReady ? "Sẵn sàng quét mã" : "Đang khởi động AI..."}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Edge GPU Accelerated</p>
                </div>
            </div>
            
            <div className="relative w-full overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-900 aspect-square">
                {(!isModelReady || !isCameraActive) && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                        <Spin indicator={<LoadingOutlined className="text-3xl text-white mb-3" spin />} />
                        <span className="text-white text-xs font-medium uppercase tracking-widest">Khởi tạo hệ thống...</span>
                    </div>
                )}

                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

                {/* Vùng quét ROI - Focus Area */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-4/5 h-1/3 border-2 border-white/30 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.5)]">
                        <div className="absolute inset-0 border-2 border-primary-500 rounded-xl animate-pulse"></div>
                        {/* Laser line */}
                        <div className="w-full h-0.5 bg-primary-400 absolute top-1/2 left-0 shadow-[0_0_10px_2px_rgba(37,99,235,0.5)]"></div>
                    </div>
                </div>

                <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-emerald-500/20 backdrop-blur-md rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">GPU ON</span>
                </div>
            </div>
            
            <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed px-4">
                Đưa mã vạch vào khung sáng. Hệ thống sẽ tự động phóng đại vùng trung tâm để tăng độ chính xác.
            </p>
        </div>
    );
};

export default BarcodeScanner;
