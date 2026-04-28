'use client';

import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common';
import { Loader2, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface ExcelPreviewDialogProps {
  file: File | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExcelPreviewDialog({
  file,
  isOpen,
  onOpenChange,
}: ExcelPreviewDialogProps) {
  const [data, setData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && isOpen) {
      parseExcel(file);
    } else {
      setData([]);
      setHeaders([]);
      setError(null);
    }
  }, [file, isOpen]);

  const parseExcel = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      
      const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
      
      if (worksheet) {
        const rows: any[][] = [];
        let headerRow: string[] = [];
        
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          // Lấy giá trị từ các cell, xử lý các kiểu dữ liệu đặc biệt (formula, object, etc.)
          const rowValues = (row.values as any[]).slice(1); // ExcelJS index bắt đầu từ 1
          
          if (rowNumber === 1) {
            headerRow = rowValues.map(v => v?.toString() || '');
          } else {
            rows.push(rowValues);
          }
        });

        if (headerRow.length > 0) {
          setHeaders(headerRow);
          setData(rows);
        } else {
          setError('File Excel không có tiêu đề hoặc rỗng');
        }
      } else {
        setError('Không tìm thấy bảng tính hợp lệ');
      }
    } catch (err) {
      console.error('ExcelJS parsing error:', err);
      setError('Không thể đọc file Excel này. Vui lòng đảm bảo file không bị khóa hoặc bị lỗi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[98vw] max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Xem trước dữ liệu: <span className="text-blue-600 truncate max-w-[400px]">{file?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto m-6 mt-4 border border-slate-200 rounded-xl bg-white shadow-inner">
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-4 bg-slate-50/50">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 animate-pulse">Đang phân tích dữ liệu Excel...</p>
            </div>
          ) : error ? (
            <div className="h-80 flex flex-col items-center justify-center gap-3 text-red-500 px-10 text-center">
              <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Lỗi đọc file</h3>
              <p className="text-sm text-slate-500 max-w-md">{error}</p>
            </div>
          ) : (
            <div className="relative">
              <Table>
                <TableHeader className="bg-slate-100/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    {headers.map((header, index) => (
                      <TableHead key={index} className="whitespace-nowrap font-bold text-slate-700 py-3 border-r border-slate-200 last:border-0">
                        {header || `Cột ${index + 1}`}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length} className="text-center py-20 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileSpreadsheet className="h-10 w-10 opacity-20" />
                          <p>Không có dữ liệu dòng nào</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0">
                        {headers.map((_, colIndex) => {
                          const cellValue = row[colIndex];
                          // Xử lý hiển thị cho các kiểu dữ liệu phức tạp của ExcelJS
                          let displayValue = '';
                          if (cellValue && typeof cellValue === 'object') {
                            if (cellValue.result !== undefined) displayValue = cellValue.result.toString();
                            else if (cellValue.richText) displayValue = cellValue.richText.map((t: any) => t.text).join('');
                            else displayValue = JSON.stringify(cellValue);
                          } else {
                            displayValue = cellValue?.toString() || '';
                          }

                          return (
                            <TableCell key={colIndex} className="text-sm text-slate-600 py-2.5 border-r border-slate-100 last:border-0">
                              {displayValue}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
          <p className="italic">* Hiển thị dữ liệu từ Sheet đầu tiên.</p>
          <p className="font-medium text-slate-500">{data.length} dòng dữ liệu được tìm thấy</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
