'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, CameraOff, CheckCircle2, Loader2, ScanBarcode } from 'lucide-react';
import type { IScannerControls } from '@zxing/browser';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { barcodeApi } from '../api/barcode.api';
import type { BarcodeLookup } from '../types/barcode';

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId?: string;
  onAdd?: (result: BarcodeLookup) => void;
}

const isExpired = (value?: string): boolean => {
  if (!value) { return false; }
  const end = new Date(value);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
};

export const BarcodeScannerDialog = ({ open, onOpenChange, warehouseId, onAdd }: BarcodeScannerDialogProps): React.JSX.Element => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BarcodeLookup | null>(null);
  const [added, setAdded] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const cameraSession = useRef(0);
  const request = useRef<AbortController | null>(null);
  const inFlight = useRef(false);
  const scanSession = useRef(0);
  const queue = useRef<string[]>([]);

  const stopCamera = useCallback((): void => {
    cameraSession.current += 1;
    controls.current?.stop();
    controls.current = null;
    const element = video.current;
    if (typeof MediaStream !== 'undefined' && element?.srcObject instanceof MediaStream) {
      element.srcObject.getTracks().forEach(track => track.stop());
      element.srcObject = null;
    }
    setCameraRunning(false);
  }, []);

  useEffect(() => {
    setError(''); setResult(null); setAdded(false); setBusy(false); setQueued(0); setPaused(false); pausedRef.current = false;
    if (!open) { setCode(''); }
    return () => {
      scanSession.current += 1;
      queue.current = [];
      request.current?.abort();
      request.current = null;
      inFlight.current = false;
      stopCamera();
    };
  }, [open, warehouseId, stopCamera]);

  const lookup = useCallback(async (raw: string): Promise<void> => {
    if (!open) { return; }
    if (pausedRef.current) { setCode(''); return; }
    const value = raw.trim();
    stopCamera();
    if (!value || value.length > 128 || /[\u0000-\u001f\u007f]/.test(value)) {
      setError('Nhập mã vạch hoặc SKU hợp lệ, tối đa 128 ký tự.');
      return;
    }
    setCode('');
    // Hardware scanners can send another label before the previous request finishes.
    if (inFlight.current) {
      queue.current.push(value);
      setQueued(queue.current.length);
      return;
    }
    inFlight.current = true;
    const session = scanSession.current;
    setBusy(true);
    let next: string | undefined = value;
    try {
      while (next && scanSession.current === session) {
        const controller = new AbortController();
        request.current = controller;
        setError(''); setResult(null); setAdded(false);
        try {
          const found = await barcodeApi.lookup(next, warehouseId, controller.signal);
          if (controller.signal.aborted || scanSession.current !== session) { break; }
          setResult(found);
          if (onAdd) { onAdd(found); setAdded(true); }
        } catch (cause: unknown) {
          if (!controller.signal.aborted && scanSession.current === session) {
            if (onAdd) { pausedRef.current = true; setPaused(true); }
            const remaining = queue.current.length;
            queue.current = [];
            setQueued(0);
            setError(`${next}: ${getApiErrorMessage(cause, 'Không thể tra cứu mã vạch')}${remaining ? ` Còn ${remaining} mã chưa xử lý, hãy quét lại.` : ''}`);
          }
          break;
        }
        next = queue.current.shift();
        setQueued(queue.current.length);
      }
    } finally {
      if (scanSession.current === session) {
        request.current = null;
        inFlight.current = false;
        setBusy(false);
        input.current?.focus();
      }
    }
  }, [open, warehouseId, onAdd, stopCamera]);

  const startCamera = async (): Promise<void> => {
    if (busy || cameraRunning) { return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera cần HTTPS hoặc localhost. Bạn vẫn có thể dùng máy quét cầm tay hoặc nhập mã.');
      return;
    }
    setError('');
    const session = ++cameraSession.current;
    setCameraRunning(true);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      if (cameraSession.current !== session || !video.current) { return; }
      const reader = new BrowserMultiFormatReader(undefined, { delayBetweenScanAttempts: 150 });
      const scanner = await reader.decodeFromConstraints({ audio: false, video: { facingMode: { ideal: 'environment' } } }, video.current,
        (detected, _failure, scannerControls) => {
          if (detected && cameraSession.current === session && !inFlight.current) {
            // Pause after one successful decode. Holding a label in frame must not add units repeatedly.
            scannerControls.stop();
            void lookup(detected.getText());
          }
        });
      if (cameraSession.current !== session) { scanner.stop(); }
      else { controls.current = scanner; }
    } catch (cause: unknown) {
      if (cameraSession.current !== session) { return; }
      stopCamera();
      const denied = cause instanceof DOMException && cause.name === 'NotAllowedError';
      setError(denied ? 'Chưa được cấp quyền camera. Hãy cho phép camera hoặc dùng máy quét cầm tay.' : 'Không mở được camera. Kiểm tra thiết bị hoặc dùng máy quét cầm tay/nhập mã.');
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-3xl' onOpenAutoFocus={event => { event.preventDefault(); input.current?.focus(); }}>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'><ScanBarcode size={20} />{onAdd ? 'Quét mã để nhập kho' : 'Quét mã kiểm tra hàng hoá'}</DialogTitle>
        <DialogDescription>{onAdd ? 'Mỗi lần quét thêm 1 đơn vị vào phiếu nháp. Tồn kho chỉ thay đổi khi xác nhận phiếu nhập.' : 'Tra cứu sản phẩm, tồn kho, số lượng giữ chỗ, lô và hạn sử dụng trong các kho bạn được phép xem.'}</DialogDescription>
      </DialogHeader>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='inventory-barcode'>Mã vạch / SKU</Label>
          <div className='flex gap-2'>
            <Input ref={input} id='inventory-barcode' value={code} maxLength={128} autoComplete='off' inputMode='text' readOnly={paused} className='font-mono'
              placeholder='Quét bằng máy cầm tay rồi nhấn Enter, hoặc nhập mã' onChange={event => setCode(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); void lookup(code); } }} />
            <Button type='button' disabled={busy || paused || !code.trim()} onClick={() => void lookup(code)}>{busy ? <Loader2 size={16} className='animate-spin' /> : 'Tra cứu'}</Button>
          </div>
          {busy && <p role='status' className='text-xs text-blue-600'>Đang tra cứu{queued ? ` · ${queued} mã đang chờ` : ''}...</p>}
          <p className='text-xs text-slate-500'>Giữ nguyên số 0 ở đầu mã. Có thể quét liên tiếp bằng máy cầm tay.</p>
        </div>
        <div className='space-y-2'>
          <Button type='button' variant='outline' className='gap-2' disabled={busy || paused} onClick={() => { if (cameraRunning) { stopCamera(); } else { void startCamera(); } }}>
            {cameraRunning ? <CameraOff size={16} /> : <Camera size={16} />}{cameraRunning ? 'Tắt camera' : 'Quét bằng camera'}
          </Button>
          <video ref={video} muted playsInline className={cameraRunning ? 'aspect-video max-h-64 w-full rounded-xl bg-black object-contain' : 'hidden'} />
          {cameraRunning && <p role='status' className='text-xs text-slate-500'>Đưa mã vào giữa khung hình. Camera sẽ dừng sau khi đọc được mã; bấm quét bằng camera để quét tiếp.</p>}
        </div>
        {error && <p role='alert' className='rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p>}
        {paused && <div className='space-y-2 rounded-xl border border-amber-200 p-3 text-sm text-amber-800'><p>Đã tạm dừng nhận mã để tránh bỏ sót hàng. Kiểm tra lỗi trên rồi quét lại các mã chưa được thêm.</p><Button type='button' variant='outline' onClick={() => { pausedRef.current = false; setPaused(false); setError(''); setCode(''); input.current?.focus(); }}>Tiếp tục quét</Button></div>}
        {added && <p role='status' className='flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800'><CheckCircle2 size={16} />Đã thêm 1 đơn vị vào phiếu nháp. Có thể quét mặt hàng tiếp theo.</p>}
        {result && <div className='space-y-4 rounded-xl border p-4'>
          <div>
            <p className='font-semibold'>{result.sku.productName}</p>
            <p className='text-sm text-slate-500'>{result.sku.variantName || 'Mặc định'} · <span className='font-mono'>{result.sku.skuCode}</span></p>
            <p className='mt-1 text-xs text-slate-500'>Barcode: <span className='font-mono'>{result.sku.barcode || 'Chưa khai báo'}</span> · {result.sku.barcodeType || 'Chưa xác định loại mã'}</p>
            {!result.sku.active && <p className='mt-2 text-sm font-medium text-amber-700'>SKU ngừng hoạt động; không thêm vào phiếu nhập mới.</p>}
          </div>
          <div className='grid grid-cols-3 gap-2 text-center'>
            {[['Tồn thực tế', result.quantityOnHand], ['Đang giữ', result.quantityLocked], ['Khả dụng', result.quantityAvailable]].map(([label, value]) =>
              <div key={label} className='rounded-lg bg-slate-50 p-3'><p className='text-xs text-slate-500'>{label}</p><p className='mt-1 text-xl font-bold'>{value}</p></div>)}
          </div>
          <p className='text-sm'>Giá vốn tham khảo: {formatCurrency(result.costPrice)} · Giá bán: {formatCurrency(result.price)}</p>
          {result.stocks.length > 0 ? <div className='max-h-64 overflow-auto rounded-lg border'>
            <table className='w-full min-w-[550px] text-left text-xs'>
              <thead className='sticky top-0 bg-slate-100'><tr>{['Kho / Lô', 'Thực tế', 'Giữ', 'Khả dụng', 'NSX / HSD'].map(label => <th key={label} className='p-2'>{label}</th>)}</tr></thead>
              <tbody>{result.stocks.map(stock => <tr key={stock.id} className='border-t'>
                <td className='p-2'><p className='font-medium'>{stock.warehouseName}</p><p className='font-mono text-slate-500'>{stock.batchCode || 'Không có mã lô'}</p></td>
                <td className='p-2'>{stock.quantityOnHand}</td><td className='p-2'>{stock.quantityLocked}</td><td className='p-2'>{stock.quantityOnHand - stock.quantityLocked}</td>
                <td className='p-2'><p>NSX: {stock.manufactureDate ? formatDate(stock.manufactureDate) : '—'}</p><p className={isExpired(stock.expiryDate) ? 'font-semibold text-red-600' : ''}>HSD: {stock.expiryDate ? formatDate(stock.expiryDate) : '—'}{isExpired(stock.expiryDate) && ' · Hết hạn'}</p></td>
              </tr>)}</tbody>
            </table>
          </div> : <p className='text-sm text-slate-500'>Mặt hàng đã có trong danh mục nhưng chưa có tồn kho trong phạm vi tra cứu.</p>}
          {!onAdd && <div className='flex flex-wrap gap-2'>
            <Button asChild type='button' variant='outline'><Link href={`/products/${result.sku.productId}`}>Xem sản phẩm</Link></Button>
            {result.sku.active && <Button asChild type='button'><Link href={`/goods-receipt/create?barcode=${encodeURIComponent(result.sku.barcode || result.sku.skuCode)}${warehouseId ? `&warehouseId=${encodeURIComponent(warehouseId)}` : ''}`}>Tạo phiếu nhập mặt hàng này</Link></Button>}
          </div>}
        </div>}
      </div>
    </DialogContent>
  </Dialog>;
};
