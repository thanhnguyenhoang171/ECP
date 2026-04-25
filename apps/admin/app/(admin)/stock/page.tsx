'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function StockPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-orange-50 p-3 rounded-full w-fit mb-4">
            <Database className="h-10 w-10 text-orange-500 opacity-80" />
          </div>
          <CardTitle>Quản lý tồn kho</CardTitle>
          <CardDescription>Hệ thống đang cập nhật dữ liệu kho hàng.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground italic">
          Vui lòng quay lại sau!
        </CardContent>
      </Card>
    </div>
  );
}
