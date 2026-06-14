'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanBarcode, 
  Camera, 
  Keyboard, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  ArrowRight, 
  Save, 
  Loader2,
  RefreshCw,
  Search
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/formatters';

interface ProductItem {
  barcode: string;
  sku: string;
  name: string;
  variantName: string;
  price: number;
  costPrice: number;
  stock: number;
  warehouse: string;
  image?: string;
}

// Cơ sở dữ liệu mẫu toàn cục/phiên làm việc (in-memory) để đồng bộ trong lúc dùng thử
const INITIAL_DATABASE: ProductItem[] = [
  {
    barcode: '893123456781',
    sku: 'IP15PM-TITAN-256',
    name: 'iPhone 15 Pro Max',
    variantName: 'Titan tự nhiên / 256GB',
    price: 34990000,
    costPrice: 26500000,
    stock: 25,
    warehouse: 'Kho Chính Quận 1',
  },
  {
    barcode: '893123456782',
    sku: 'IP15PM-TITAN-256-Q7',
    name: 'iPhone 15 Pro Max',
    variantName: 'Titan tự nhiên / 256GB',
    price: 34990000,
    costPrice: 26500000,
    stock: 3,
    warehouse: 'Kho Phụ Quận 7',
  },
  {
    barcode: '893123456783',
    sku: 'MBP14-M3-SILVER',
    name: 'MacBook Pro 14 M3',
    variantName: 'Silver / M3 / 16GB',
    price: 45990000,
    costPrice: 38000000,
    stock: 8,
    warehouse: 'Kho Chính Quận 1',
  },
  {
    barcode: '893123456784',
    sku: 'S24-ULTRA-BLACK-512',
    name: 'Samsung Galaxy S24 Ultra',
    variantName: 'Titanium Black / 512GB',
    price: 29990000,
    costPrice: 22000000,
    stock: 0,
    warehouse: 'Kho Phụ Quận 7',
  },
  {
    barcode: '893123456785',
    sku: 'S24-ULTRA-BLACK-512-Q1',
    name: 'Samsung Galaxy S24 Ultra',
    variantName: 'Titanium Black / 512GB',
    price: 29990000,
    costPrice: 22000000,
    stock: 12,
    warehouse: 'Kho Chính Quận 1',
  },
  {
    barcode: '893123456786',
    sku: 'AIRPODS-GEN2',
    name: 'AirPods Pro Gen 2',
    variantName: 'White / Type-C',
    price: 5990000,
    costPrice: 4200000,
    stock: 48,
    warehouse: 'Kho Phụ Quận 7',
  }
];

// Biến lưu trữ tạm thời trong RAM của client để giữ trạng thái qua các lần đóng/mở Dialog
let clientDatabase: ProductItem[] = [...INITIAL_DATABASE];

interface BarcodeScannerProps {
  onClose?: () => void;
}

export default function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedProduct, setScannedProduct] = useState<ProductItem | null>(null);
  
  // Trạng thái Camera mô phỏng
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>('Ready');
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Lịch sử quét gần đây
  const [recentScans, setRecentScans] = useState<ProductItem[]>([]);
  
  // Inline adjustment state
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [isSavingStock, setIsSavingStock] = useState(false);

  // Dọn dẹp timer khi component bị hủy
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  // Mô phỏng quét mã bằng Camera
  const handleStartCameraScan = () => {
    setCameraActive(true);
    setScanningStatus('Scanning');
    setScannedProduct(null);

    // Hủy timer cũ nếu có
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);

    // Sau 2 giây sẽ quét trúng một sản phẩm ngẫu nhiên
    scanTimerRef.current = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * clientDatabase.length);
      const targetProduct = clientDatabase[randomIndex];
      
      setScannedProduct(targetProduct);
      setAdjustQty(targetProduct.stock);
      setScanningStatus('Success');
      setCameraActive(false);
      toast.success(`Đã quét thành công mã: ${targetProduct.barcode}`);

      // Thêm vào danh sách quét gần đây nếu chưa có
      setRecentScans(prev => {
        const filtered = prev.filter(p => p.sku !== targetProduct.sku);
        return [targetProduct, ...filtered].slice(0, 5);
      });
    }, 2000);
  };

  const handleStopCameraScan = () => {
    setCameraActive(false);
    setScanningStatus('Ready');
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
  };

  // Tìm kiếm thủ công
  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập mã vạch hoặc SKU!');
      return;
    }

    const query = searchQuery.trim().toUpperCase();
    const found = clientDatabase.find(
      p => p.barcode === query || p.sku.toUpperCase() === query
    );

    if (found) {
      setScannedProduct(found);
      setAdjustQty(found.stock);
      toast.success(`Tìm thấy sản phẩm: ${found.name}`);
      
      // Thêm vào danh sách quét gần đây
      setRecentScans(prev => {
        const filtered = prev.filter(p => p.sku !== found.sku);
        return [found, ...filtered].slice(0, 5);
      });
    } else {
      setScannedProduct(null);
      toast.error('Không tìm thấy sản phẩm nào khớp với mã vạch / SKU đã nhập!');
    }
  };

  // Cập nhật tồn kho nhanh
  const handleUpdateStock = () => {
    if (!scannedProduct) return;
    if (adjustQty < 0) {
      toast.error('Số lượng tồn kho không thể âm!');
      return;
    }

    setIsSavingStock(true);

    // Giả lập lưu vào DB
    setTimeout(() => {
      clientDatabase = clientDatabase.map(p => {
        if (p.sku === scannedProduct.sku && p.warehouse === scannedProduct.warehouse) {
          return { ...p, stock: adjustQty };
        }
        return p;
      });

      const updatedProduct = { ...scannedProduct, stock: adjustQty };
      setScannedProduct(updatedProduct);
      
      // Cập nhật trong danh sách quét gần đây
      setRecentScans(prev => prev.map(p => p.sku === updatedProduct.sku ? updatedProduct : p));
      
      setIsSavingStock(false);
      toast.success('Cập nhật tồn kho thành công!');
    }, 800);
  };

  // Xem chi tiết tại kho hàng
  const handleGoToStock = (sku: string) => {
    if (onClose) onClose();
    router.push(`/stock?sku=${sku}`);
  };

  // Tạo sản phẩm mới
  const handleCreateProduct = (barcode: string) => {
    if (onClose) onClose();
    router.push(`/products?create=true&barcode=${barcode}`);
  };

  return (
    <div className="space-y-5">
      {/* Stylesheet injection for keyframe animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-laser {
          0% { top: 4%; opacity: 0.8; }
          50% { top: 96%; opacity: 1; }
          100% { top: 4%; opacity: 0.8; }
        }
        .laser-line {
          animation: scan-laser 2.5s infinite ease-in-out;
        }
      `}} />

      {/* Mode selectors */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full border border-slate-200">
        <button
          type="button"
          onClick={() => {
            handleStopCameraScan();
            setScanMode('camera');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            scanMode === 'camera' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Camera size={14} />
          Quét Camera
        </button>
        <button
          type="button"
          onClick={() => {
            handleStopCameraScan();
            setScanMode('manual');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            scanMode === 'manual' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Keyboard size={14} />
          Nhập mã tay
        </button>
      </div>

      {/* Main scanning viewport */}
      <div>
        {scanMode === 'camera' ? (
          <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-6 group">
            {cameraActive && (
              <>
                {/* Simulated scanner viewfinder overlay */}
                <div className="absolute inset-x-8 inset-y-6 border-2 border-emerald-500/30 rounded-lg pointer-events-none transition-all duration-300">
                  {/* Corners */}
                  <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-emerald-500"></div>
                  <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-emerald-500"></div>
                  <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-emerald-500"></div>
                  <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-emerald-500"></div>
                  
                  {/* Glowing Laser line */}
                  <div className="laser-line absolute left-2 right-2 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                </div>
              </>
            )}

            <div className="z-10 space-y-4">
              {cameraActive ? (
                <>
                  <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 animate-pulse">
                    <RefreshCw size={24} className="animate-spin duration-1000" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Đang khởi động Camera...</h4>
                    <p className="text-xs text-slate-400 mt-1">Vui lòng hướng mã vạch của sản phẩm vào trung tâm khung hình</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleStopCameraScan} 
                    className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Dừng quét
                  </Button>
                </>
              ) : (
                <>
                  <div className="inline-flex p-4 bg-slate-900 rounded-full border border-slate-800 text-slate-500">
                    <ScanBarcode size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Đang chờ tín hiệu Camera</h4>
                    <p className="text-xs text-slate-500 mt-1">Chế độ mô phỏng quét camera thông minh</p>
                  </div>
                  <Button 
                    type="button"
                    onClick={handleStartCameraScan} 
                    className="shadow-lg bg-primary hover:bg-primary/90 text-white font-bold"
                  >
                    Bật Camera quét thử
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Nhập Barcode (ví dụ: 893123456781) hoặc SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 bg-white border-slate-200 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button type="submit" className="h-11 px-5 font-bold">
                Xác nhận
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Keyboard size={12} /> Bạn có thể sử dụng đầu đọc máy quét vật lý cắm cổng USB/Bluetooth để quét thẳng vào ô nhập.
            </p>
          </form>
        )}
      </div>

      {/* Scan Results Card */}
      {scannedProduct ? (
        <Card className="border-primary/30 bg-primary/5 shadow-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px]">
              Đã nhận diện
            </Badge>
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm">
                <Package size={32} className="text-primary" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 truncate leading-snug">
                  {scannedProduct.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {scannedProduct.variantName}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-600 border-slate-200 uppercase">
                    SKU: {scannedProduct.sku}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                    Barcode: {scannedProduct.barcode}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Warehouse and price info */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-dashed border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Kho bãi</span>
                <span className="text-sm font-semibold text-slate-700">{scannedProduct.warehouse}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Giá niêm yết</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(scannedProduct.price)}</span>
              </div>
            </div>

            {/* Inline fast stock adjustment */}
            <div className="space-y-2 bg-white/70 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Điều chỉnh nhanh tồn kho:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500">Tồn hiện tại:</span>
                  <Badge className={
                    scannedProduct.stock === 0 
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-none' 
                      : scannedProduct.stock <= 5 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none'
                  }>
                    {scannedProduct.stock} cái
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner flex-1">
                  <button
                    type="button"
                    onClick={() => setAdjustQty(Math.max(0, adjustQty - 1))}
                    disabled={isSavingStock}
                    className="px-3.5 py-2 hover:bg-slate-50 border-r border-slate-200 text-slate-600 disabled:opacity-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
                    disabled={isSavingStock}
                    className="w-full text-center border-none outline-none font-bold text-sm bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQty(adjustQty + 1)}
                    disabled={isSavingStock}
                    className="px-3.5 py-2 hover:bg-slate-50 border-l border-slate-200 text-slate-600 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <Button
                  type="button"
                  onClick={handleUpdateStock}
                  disabled={isSavingStock || adjustQty === scannedProduct.stock}
                  size="sm"
                  className="font-bold flex items-center gap-1.5 h-9"
                >
                  {isSavingStock ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Lưu
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGoToStock(scannedProduct.sku)}
                className="flex-1 text-xs font-semibold h-9 border-slate-200 hover:bg-slate-50"
              >
                Xem chi tiết kho
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : searchQuery && !scannedProduct ? (
        <Card className="border-amber-200 bg-amber-50/20 p-5 rounded-xl text-center space-y-4">
          <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase">Không tìm thấy sản phẩm</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không tìm thấy mã vạch hoặc mã SKU <strong>&quot;{searchQuery}&quot;</strong> nào trong hệ thống.
            </p>
          </div>
          <Button 
            type="button" 
            onClick={() => handleCreateProduct(searchQuery)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
          >
            Tạo mới sản phẩm với mã này
          </Button>
        </Card>
      ) : null}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Đã quét gần đây
          </h4>
          <div className="space-y-2">
            {recentScans.map((p, index) => (
              <div 
                key={`${p.sku}-${index}`}
                onClick={() => {
                  setScannedProduct(p);
                  setAdjustQty(p.stock);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-primary/20 bg-slate-50/50 hover:bg-primary/5 cursor-pointer transition-all duration-150 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-white rounded border border-slate-100 group-hover:border-primary/20 shrink-0">
                    <Package size={14} className="text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-700 truncate group-hover:text-primary">{p.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">Barcode: {p.barcode} • SKU: {p.sku}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[10px] font-semibold bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary">
                    Kho: {p.stock}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
