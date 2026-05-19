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
import { cn } from '@/lib/utils';

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
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && isOpen) {
      parseExcel(file, activeSheet);
    } else {
      setData([]);
      setHeaders([]);
      setSheetNames([]);
      setActiveSheet('');
      setError(null);
    }
  }, [file, isOpen, activeSheet]);

  const parseExcel = async (file: File, sheetName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      
      const allSheets = workbook.worksheets.map(s => s.name);
      setSheetNames(allSheets);

      // Nếu chưa có sheet active hoặc sheet active không tồn tại trong file mới
      let currentSheetName = sheetName;
      if (!currentSheetName || !allSheets.includes(currentSheetName)) {
        currentSheetName = allSheets[0];
        setActiveSheet(currentSheetName);
      }

      const worksheet = workbook.getWorksheet(currentSheetName);
      
      if (worksheet) {
        const rows: string[][] = [];
        let headerRow: string[] = [];
        
        const colCount = worksheet.actualColumnCount || worksheet.columnCount;
        
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const rowValues: string[] = [];
          
          for (let i = 1; i <= colCount; i++) {
            const cell = row.getCell(i);
            let displayValue = '';
            
            if (cell.value !== null && cell.value !== undefined) {
              if (typeof cell.value === 'object') {
                if (cell.value instanceof Date) {
                  displayValue = cell.value.toLocaleDateString('vi-VN');
                } else if ('formula' in cell.value || 'sharedFormula' in cell.value) {
                  // Trường hợp công thức
                  const result = (cell.value as any).result;
                  if (result !== undefined && result !== null) {
                    if (result instanceof Date) {
                      displayValue = result.toLocaleDateString('vi-VN');
                    } else if (typeof result === 'object' && 'error' in result) {
                      displayValue = result.error?.toString() || '#ERROR';
                    } else {
                      displayValue = result.toString();
                    }
                  } else {
                    displayValue = ''; // Không có kết quả thì để trống
                  }
                } else if ('richText' in cell.value) {
                  displayValue = (cell.value.richText || []).map((t: any) => t.text).join('');
                } else if ('hyperlink' in cell.value) {
                  displayValue = (cell.value as any).text?.toString() || (cell.value as any).hyperlink?.toString() || '';
                } else if ('error' in cell.value) {
                  displayValue = (cell.value as any).error?.toString() || '';
                } else {
                  // Fallback cho các object khác không xác định
                  displayValue = ''; 
                }
              } else {
                displayValue = cell.value.toString();
              }
            }
            rowValues.push(displayValue);
          }
          
          if (rowNumber === 1) {
            headerRow = rowValues;
          } else {
            rows.push(rowValues);
          }
        });

        if (headerRow.length > 0) {
          setHeaders(headerRow);
          setData(rows);
        } else {
          setError(`Sheet "${currentSheetName}" không có dữ liệu hoặc rỗng`);
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
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 shrink-0">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Xem trước dữ liệu: <span className="text-blue-600 truncate max-w-[300px]">{file?.name}</span>
            </DialogTitle>

            {/* Sheet Selector */}
            {sheetNames.length > 1 && (
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
                {sheetNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setActiveSheet(name)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                      activeSheet === name
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <p className="text-sm font-medium text-slate-500 animate-pulse">Đang phân tích dữ liệu {activeSheet ? `sheet "${activeSheet}"...` : 'Excel...'}</p>
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
                        {header || ""}
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
                        {headers.map((_, colIndex) => (
                          <TableCell key={colIndex} className="text-sm text-slate-600 py-2.5 border-r border-slate-100 last:border-0 whitespace-nowrap">
                            {row[colIndex] || ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
          <p className="italic">* Đang hiển thị dữ liệu từ Sheet: <span className="font-bold text-slate-600">{activeSheet}</span></p>
          <p className="font-medium text-slate-500">{data.length} dòng dữ liệu được tìm thấy</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
