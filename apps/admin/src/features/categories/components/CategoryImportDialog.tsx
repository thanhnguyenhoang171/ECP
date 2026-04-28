'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button, FileUpload } from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ExcelPreviewDialog from './ExcelPreviewDialog';
import { toast } from 'sonner';

interface CategoryImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CategoryImportDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: CategoryImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Giả lập tiến trình upload khi nhấn nút "Bắt đầu nhập"
  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setUploadProgress(0);

    const duration = 2000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    try {
      await new Promise(resolve => setTimeout(resolve, duration + 500));
      toast.success('Nhập dữ liệu thành công');
      onOpenChange(false);
      setFile(null);
      onSuccess?.();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi nhập dữ liệu');
    } finally {
      setIsImporting(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadTemplate = () => {
    toast.info('Đang chuẩn bị tệp mẫu...');
  };

  const handlePreview = (selectedFile: File) => {
    setFile(selectedFile);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Nhập danh mục từ Excel
            </DialogTitle>
            <DialogDescription>
              Tải lên file Excel chứa danh sách danh mục để nhập nhanh vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Download Section */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-blue-900">Bạn chưa có file mẫu?</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Tải xuống file Excel mẫu để đảm bảo dữ liệu của bạn đúng định dạng yêu cầu của hệ thống.
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-blue-600 font-bold hover:text-blue-700 mt-1"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-3 w-3 mr-1" /> Tải file mẫu (.xlsx)
                </Button>
              </div>
            </div>

            {/* Reusable FileUpload Component with Excel Preview */}
            <FileUpload 
              value={file}
              onChange={setFile}
              onPreview={handlePreview}
              isUploading={isImporting}
              progress={Math.round(uploadProgress)}
              accept={{
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'application/vnd.ms-excel': ['.xls']
              }}
              description="Chỉ hỗ trợ file Excel (.xlsx, .xls)"
            />

            {/* Guidelines */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" /> Lưu ý khi nhập dữ liệu
              </h5>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                <li>Hệ thống sẽ tự động tạo Slug nếu bỏ trống.</li>
                <li>Tên danh mục là bắt buộc và không được trùng lặp.</li>
                <li>Nếu là danh mục con, hãy điền đúng ID của danh mục cha.</li>
                <li>Định dạng cột phải khớp chính xác với file mẫu.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="min-w-[100px]"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Bắt đầu nhập'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Data Preview Dialog */}
      <ExcelPreviewDialog 
        file={file}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  );
}
