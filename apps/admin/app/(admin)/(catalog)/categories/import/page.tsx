'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle,
  Loader2,
  Layers
} from 'lucide-react';
import { Button, FileUpload, PageHeader, Breadcrumbs } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import ExcelPreviewDialog from '@/features/categories/components/ExcelPreviewDialog';
import { toast } from 'sonner';
import { categoryApi } from '@/features/categories/api/category.api';
import { useImportCategory } from '@/features/categories/hooks/use-category-mutation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

export default function CategoryImportPage() {
  const router = useRouter();
  const { isSidebarCollapsed } = useUIStore();
  
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
        setFile(null);
        toast.success('Nhập danh sách danh mục thành công');
        router.push('/categories');
        router.refresh();
      },
      onError: (error: any) => {
        setIsImporting(false);
        const message = error?.message || error?.error || 'Đã có lỗi xảy ra khi nhập dữ liệu';
        setImportError(message);
        toast.error('Nhập dữ liệu thất bại');
      }
    });
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

  const breadcrumbItems = [
    { label: 'Danh mục', href: '/categories', icon: Layers },
    { label: 'Nhập danh mục từ Excel' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader 
        title="Nhập danh mục từ Excel" 
        description="Tải lên file Excel chứa danh sách danh mục để nhập nhanh vào hệ thống."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Upload box and errors (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {importError && (
            <Card className="bg-red-50 border-red-100 shadow-none w-full overflow-hidden">
              <CardContent className="p-4 flex items-start gap-3">
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

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <FileUpload 
              value={file}
              onChange={(f) => {
                setFile(f);
                setImportError(null);
              }}
              isUploading={isImporting}
              progress={isImporting ? 50 : 0}
              accept={{
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'application/vnd.ms-excel': ['.xls']
              }}
              description="Chỉ hỗ trợ file Excel (.xlsx, .xls)"
            />

            {file && (
              <div className="flex justify-end mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  Xem trước dữ liệu Excel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: template card & guidelines (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Template Download Section */}
          <Card className="bg-blue-50/50 border-blue-100/60 shadow-none w-full overflow-hidden rounded-2xl">
            <CardContent className="p-5 flex items-start gap-3">
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
                  className="h-auto p-0 text-blue-600 font-bold hover:text-blue-700 mt-2 block"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-3 w-3 mr-1 inline shrink-0" /> Tải file mẫu (.xlsx)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <AlertCircle className="h-3 w-3 text-blue-500" /> Lưu ý khi nhập dữ liệu
            </h5>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Hệ thống sẽ tự động tạo Slug nếu bỏ trống.</li>
              <li>Tên danh mục là bắt buộc và không được trùng lặp.</li>
              <li>Nếu là danh mục con, hãy điền đúng Slug của danh mục cha.</li>
              <li>Định dạng cột phải khớp chính xác với file mẫu.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky Actions Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-3.5 z-50 shadow-lg transition-all duration-200",
        isSidebarCollapsed ? "lg:left-20" : "lg:left-64"
      )}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6">
          <div className="hidden md:flex items-center gap-2">
            {file ? (
              <>
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider max-w-sm truncate">
                  Tệp tin đã chọn: {file.name}
                </p>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chưa chọn tệp tin
                </p>
              </>
            )}
          </div>
          <div className="flex gap-3 w-full md:w-auto justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.push('/categories')} 
              className="font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100" 
              disabled={isImporting}
            >
              Hủy bỏ
            </Button>
            <Button 
              type="button"
              onClick={handleImport}
              disabled={!file || isImporting}
              className="bg-blue-600 hover:bg-blue-700 px-10 font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-200"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang nhập...
                </>
              ) : (
                'Bắt đầu nhập'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Excel Data Preview Dialog */}
      <ExcelPreviewDialog 
        file={file}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
}
