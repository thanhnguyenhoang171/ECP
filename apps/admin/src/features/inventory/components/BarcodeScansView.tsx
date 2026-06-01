'use client';

import React, { useState } from 'react';
import { ScanBarcode, Camera, Keyboard, Package, CheckCircle2, Info } from "lucide-react";
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BarcodeScansView() {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quét mã vạch"
        description="Nhập/Xuất hàng nhanh chóng bằng cách quét mã vạch hoặc mã QR."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="bg-slate-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Camera size={18} className="text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider">Máy quét trực tiếp</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={scanMode === 'camera' ? 'default' : 'ghost'} 
                  className={scanMode === 'camera' ? "" : "text-slate-400"}
                  onClick={() => setScanMode('camera')}
                >
                  Camera
                </Button>
                <Button 
                  size="sm" 
                  variant={scanMode === 'manual' ? 'default' : 'ghost'} 
                  className={scanMode === 'manual' ? "" : "text-slate-400"}
                  onClick={() => setScanMode('manual')}
                >
                  Nhập tay
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              {scanMode === 'camera' ? (
                <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center border-b border-slate-200 relative group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                    <ScanBarcode size={120} />
                  </div>
                  <div className="z-10 text-center space-y-4">
                    <div className="p-4 bg-white rounded-full shadow-xl animate-pulse">
                      <Camera size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Đang chờ tín hiệu Camera...</p>
                      <p className="text-xs text-slate-400">Vui lòng cấp quyền truy cập để sử dụng</p>
                    </div>
                    <Button size="sm" className="shadow-lg">Bật Camera</Button>
                  </div>
                </div>
              ) : (
                <div className="p-12 bg-slate-50 flex flex-col items-center justify-center border-b border-slate-200 space-y-6">
                  <div className="w-full max-w-sm space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Mã Barcode / SKU</label>
                    <div className="flex gap-2">
                      <Input placeholder="Nhập mã vạch..." className="h-12 text-lg font-mono bg-white" />
                      <Button className="h-12 px-6">Xác nhận</Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Keyboard size={14} /> Sử dụng máy quét cầm tay hoặc nhập từ bàn phím
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Area */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Kết quả quét gần đây
            </h3>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded border border-slate-100">
                      <Package size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">iPhone 15 Pro Max ({i === 1 ? 'TITAN-256' : 'BLUE-128'})</p>
                      <p className="text-[10px] font-mono text-slate-400 tracking-wider">89312345678{i}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px]">
                    Thành công
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-indigo-50/30 border-dashed">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <Info size={18} />
                <h4 className="text-sm font-bold">Hướng dẫn nhanh</h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Đưa mã vạch vào khung hình camera để tự động nhận diện.</li>
                <li>Hệ thống hỗ trợ chuẩn EAN-13, Code 128 và QR Code.</li>
                <li>Nếu camera không hoạt động, hãy sử dụng chế độ &quot;Nhập tay&quot;.</li>
                <li>Có thể kết nối máy quét vật lý qua cổng USB/Bluetooth.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
