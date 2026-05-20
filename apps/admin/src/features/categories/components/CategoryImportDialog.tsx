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
import { Card, CardContent } from '@/components/ui/card';
import ExcelPreviewDialog from './ExcelPreviewDialog';
import { toast } from 'sonner';
import { categoryApi } from '../api/category.api';
import { useImportCategory } from '../hooks/use-category-mutation';

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importMutation = useImportCategory();

  const handleImport = () => {
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    
    importMutation.mutate(file, {
      onSuccess: () => {
        setIsImporting(false);
        onOpenChange(false);
        setFile(null);
        onSuccess?.();
      },
      onError: (error: any) => {
        setIsImporting(false);
        // Hiển thị lỗi chi tiết từ server nếu có
        const message = error?.message || error?.error || 'Đã có lỗi xảy ra khi nhập dữ liệu';
        setImportError(message);
      }
    });
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setImportError(null);
      setFile(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info('Đang chuẩn bị tệp mẫu...');
      const blob = await categoryApi.template();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mau_nhap_danh_muc.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Không thể tải file mẫu. Vui lòng thử lại sau.');
    }
  };

  const handlePreview = (selectedFile: File) => {
    setFile(selectedFile);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Nhập danh mục từ Excel
            </DialogTitle>
            <DialogDescription>
              Tải lên file Excel chứa danh sách danh mục để nhập nhanh vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full min-w-0 overflow-hidden">
            {/* Error Message Section */}
            {importError && (
              <Card className="bg-red-50 border-red-100 shadow-none w-full overflow-hidden">
                <CardContent className="p-4 flex items-start gap-3 min-w-0">
                  <div className="bg-red-100 p-2 rounded-lg shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-semibold text-red-900">Lỗi nhập dữ liệu</h4>
                    <p className="text-xs text-red-700 leading-relaxed whitespace-pre-wrap">
                      {importError}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Template Download Section */}
            <Card className="bg-blue-50/50 border-blue-100 shadow-none w-full overflow-hidden">
              <CardContent className="p-4 flex items-start gap-3 min-w-0">
                <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-semibold text-blue-900 truncate">Bạn chưa có file mẫu?</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Tải xuống file Excel mẫu để đảm bảo dữ liệu của bạn đúng định dạng yêu cầu của hệ thống.
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-blue-600 font-bold hover:text-blue-700 mt-1"
                    onClick={handleDownloadTemplate}
                  >
                    <Download className="h-3 w-3 mr-1 shrink-0" /> Tải file mẫu (.xlsx)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reusable FileUpload Component with Excel Preview */}
            <FileUpload 
              value={file}
              onChange={(f) => {
                setFile(f);
                setImportError(null);
              }}
              onPreview={handlePreview}
              isUploading={isImporting}
              progress={isImporting ? 50 : 0}
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
                <li>Nếu là danh mục con, hãy điền đúng Slug của danh mục cha.</li>
                <li>Định dạng cột phải khớp chính xác với file mẫu.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
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
