import React, { useEffect, useRef, useState } from 'react';
import { message, Spin } from 'antd';
import { yoloService } from '../../../api/services/yoloService';
import { imageHelper } from '../../../utils/imageHelper';
import { BarcodeOutlined, LoadingOutlined } from '@ant-design/icons';

export const BarcodeScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelReady, setIsModelReady] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);

    // 1. Tải AI Model (Thực tế)
    useEffect(() => {
        yoloService.loadModel()
            .then(() => setIsModelReady(true))
            .catch((err) => {
              console.error(err);
              message.error("Lỗi khởi động hệ thống AI. Vui lòng kiểm tra file model!");
            });
    }, []);

    // 2. Khởi động Camera
    useEffect(() => {
        let currentStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 640 },
                        height: { ideal: 640 } 
                    }
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
                message.error("Vui lòng cấp quyền truy cập Camera!");
            }
        };

        startCamera();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 3. Vòng lặp xử lý AI thời gian thực (Real Inference)
    useEffect(() => {
        let animationId: number;
        let lastRunTime = 0;

        const processFrame = async (timestamp: number) => {
            // Chạy tối đa 10-12 FPS để đảm bảo CPU/GPU không quá tải
            if (timestamp - lastRunTime < 80) {
                animationId = requestAnimationFrame(processFrame);
                return;
            }

            if (isModelReady && videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                
                if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused) {
                    try {
                        lastRunTime = timestamp;

                        // Tiền xử lý
                        const inputTensor = imageHelper.videoToTensor(video);
                        
                        // Chạy Inference thật
                        const output = await yoloService.detect(inputTensor);
                        
                        // Bóc tách kết quả
                        const topBox = imageHelper.getTopBox(output);

                        const ctx = canvas.getContext('2d')!;
                        canvas.width = video.clientWidth;
                        canvas.height = video.clientHeight;
                        
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        if (topBox) {
                            // Scale từ 640x640 về kích thước hiển thị thực tế
                            const scaleX = canvas.width / 640;
                            const scaleY = canvas.height / 640;

                            const drawX = topBox.x * scaleX;
                            const drawY = topBox.y * scaleY;
                            const drawW = topBox.w * scaleX;
                            const drawH = topBox.h * scaleY;

                            // Vẽ Bounding Box
                            ctx.strokeStyle = '#10b981'; 
                            ctx.lineWidth = 3;
                            ctx.strokeRect(drawX, drawY, drawW, drawH);
                            
                            // Vẽ Label tin cậy
                            ctx.fillStyle = '#10b981';
                            ctx.fillRect(drawX, drawY - 25, 55, 25);
                            ctx.fillStyle = '#FFFFFF';
                            ctx.font = 'bold 12px Inter, Arial';
                            ctx.fillText(`${(topBox.prob * 100).toFixed(0)}%`, drawX + 5, drawY - 8);
                        }
                    } catch (e) {
                        // Tránh log liên tục làm chậm máy
                        if (timestamp % 100 === 0) console.error("Inference Error:", e);
                    }
                }
            }
            animationId = requestAnimationFrame(processFrame);
        };

        animationId = requestAnimationFrame(processFrame);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isModelReady]);

    return (
        <div className="flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-soft border border-slate-100 font-sans">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                    <BarcodeOutlined className="text-xl" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-none">
                        {isModelReady ? "Sẵn sàng quét mã" : "Đang khởi động AI..."}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 text-left">Hệ thống nhận diện mã vạch AI YOLOv11</p>
                </div>
            </div>
            
            <div className="relative w-full overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-slate-900 aspect-square group">
                {(!isModelReady || !isCameraActive) && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                        <Spin indicator={<LoadingOutlined className="text-4xl text-white mb-4" spin />} />
                        <span className="text-white text-sm font-medium tracking-wide">Đang nạp bộ não AI...</span>
                    </div>
                )}

                <video 
                    ref={videoRef} 
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline 
                    muted 
                />
                
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                {/* UI Target Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-4/5 h-1/3 border-2 border-primary-500 bg-primary-500/10 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]">
                        <div className="w-full h-0.5 bg-primary-400 opacity-70 absolute top-1/2 left-0 transform -translate-y-1/2 shadow-[0_0_15px_3px_rgba(37,99,235,0.6)] animate-pulse"></div>
                        
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
                    </div>
                </div>

                {/* Real-time Status Badge */}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                        {isCameraActive ? 'LIVE AI' : 'CONNECTING'}
                    </span>
                </div>
            </div>
            
            <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 w-full">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 mt-0.5">
                    <span className="text-xs font-bold font-sans">i</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed m-0 text-left">
                    Đưa mã vạch vào trung tâm khung quét. Công nghệ <span className="text-primary-600 font-semibold italic">Edge AI</span> sẽ xử lý trực tiếp trên thiết bị của bạn.
                </p>
            </div>
        </div>
    );
};

export default BarcodeScanner;
